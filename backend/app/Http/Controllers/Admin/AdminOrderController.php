<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Jobs\ReleaseExpiredReservationJob;
use App\Jobs\SendOrderShippedNotificationJob;
use App\Models\Order;
use App\Services\BatchAllocationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use OpenApi\Annotations as OA;

class AdminOrderController extends Controller
{
    public function __construct(private readonly BatchAllocationService $allocationService) {}

    /**
     * @OA\Get(
     *     path="/admin/orders",
     *     tags={"Admin"},
     *     summary="Daftar order",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="status", in="query", @OA\Schema(type="string")),
     *     @OA\Parameter(name="per_page", in="query", @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Daftar order")
     * )
     */
    public function index(Request $request)
    {
        $this->authorize('admin');

        $orders = Order::with(['user', 'items'])
            ->when($request->filled('status'), fn($q) => $q->where('status', $request->string('status')))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return $this->success($orders);
    }

    /**
     * @OA\Post(
     *     path="/admin/orders/manual",
     *     tags={"Admin"},
     *     summary="Buat pesanan manual (offline/marketplace)",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=201, description="Pesanan manual berhasil dibuat")
     * )
     */
    public function storeManual(Request $request)
    {
        $this->authorize('admin');

        $allowedStatuses = [
            'belum_dibayar',
            'menunggu_konfirmasi',
            'diproses',
            'dikirim',
            'selesai',
            'dibatalkan',
        ];

        $channelOptions = ['offline', 'online', 'shopee', 'tokopedia', 'tiktokshop', 'whatsapp', 'lainnya'];

        $data = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'channel' => ['nullable', 'string', 'max:50', Rule::in($channelOptions)],
            'external_order_id' => ['nullable', 'string', 'max:100'],
            'ordered_at' => ['nullable', 'date'],
            'status' => ['nullable', Rule::in($allowedStatuses)],
            'metode_pembayaran' => ['nullable', 'in:BCA,BSI,gopay,dana,transfer_manual'],
            'courier' => ['nullable', 'string', 'max:50'],
            'courier_service' => ['nullable', 'string', 'max:50'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'allocate_stock' => ['sometimes', 'boolean'],
            'customer.name' => ['required', 'string', 'max:255'],
            'customer.email' => ['nullable', 'email'],
            'customer.phone' => ['required', 'string', 'max:30'],
            'customer.address' => ['required', 'string'],
            'customer.province_id' => ['nullable', 'integer'],
            'customer.province_name' => ['nullable', 'string', 'max:100'],
            'customer.city_id' => ['nullable', 'integer'],
            'customer.city_name' => ['nullable', 'string', 'max:100'],
            'customer.district_id' => ['nullable', 'integer'],
            'customer.district_name' => ['nullable', 'string', 'max:100'],
            'customer.subdistrict_id' => ['nullable', 'integer'],
            'customer.subdistrict_name' => ['nullable', 'string', 'max:100'],
            'customer.postal_code' => ['nullable', 'string', 'max:10'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.batches' => ['nullable', 'array'],
            'items.*.batches.*.batch_id' => ['required_with:items.*.batches', 'exists:product_batches,id'],
            'items.*.batches.*.qty' => ['required_with:items.*.batches', 'integer', 'min:1'],
        ], [], [
            'customer.name' => 'nama customer',
            'customer.phone' => 'telepon customer',
            'customer.address' => 'alamat customer',
        ]);

        $items = collect($data['items'])->map(function ($item) {
            return [
                'product_id' => (int) $item['product_id'],
                'qty' => (int) $item['qty'],
                'price' => (float) $item['price'],
                'batches' => collect($item['batches'] ?? [])
                    ->map(function ($batch) {
                        return [
                            'batch_id' => (int) ($batch['batch_id'] ?? 0),
                            'qty' => (int) ($batch['qty'] ?? 0),
                        ];
                    })
                    ->filter(fn($batch) => $batch['batch_id'] > 0 && $batch['qty'] > 0)
                    ->values()
                    ->all(),
            ];
        });

        $subtotal = $items->reduce(fn($sum, $item) => $sum + ($item['qty'] * $item['price']), 0);
        $shippingCost = (float) ($data['shipping_cost'] ?? 0);
        $total = $subtotal + $shippingCost;
        $orderedAt = isset($data['ordered_at'])
            ? Carbon::parse($data['ordered_at'])
            : now();
        $status = $data['status'] ?? 'diproses';
        $channel = $data['channel'] ?? 'offline';
        $shouldAllocate = $request->boolean('allocate_stock', true);

        try {
            $order = DB::transaction(function () use ($data, $items, $subtotal, $shippingCost, $total, $orderedAt, $status, $channel, $shouldAllocate) {
                /** @var Order $order */
                $order = Order::create([
                    'user_id' => $data['user_id'] ?? null,
                    'customer_id' => $data['user_id'] ?? null,
                    'customer_name' => $data['customer']['name'] ?? null,
                    'customer_email' => $data['customer']['email'] ?? null,
                    'phone' => $data['customer']['phone'] ?? null,
                    'address' => $data['customer']['address'] ?? null,
                    'destination_province_id' => $data['customer']['province_id'] ?? null,
                    'destination_province_name' => $data['customer']['province_name'] ?? null,
                    'destination_city_id' => $data['customer']['city_id'] ?? null,
                    'destination_city_name' => $data['customer']['city_name'] ?? null,
                    'destination_district_id' => $data['customer']['district_id'] ?? null,
                    'destination_subdistrict_id' => $data['customer']['subdistrict_id'] ?? null,
                    'destination_district_name' => $data['customer']['district_name'] ?? null,
                    'destination_subdistrict_name' => $data['customer']['subdistrict_name'] ?? null,
                    'destination_postal_code' => $data['customer']['postal_code'] ?? null,
                    'subtotal' => $subtotal,
                    'ongkos_kirim' => $shippingCost,
                    'total' => $total,
                    'gross_revenue' => $subtotal,
                    'net_revenue' => $total,
                    'discount' => 0,
                    'channel' => $channel,
                    'external_order_id' => $data['external_order_id'] ?? null,
                    'status' => $status,
                    'metode_pembayaran' => $data['metode_pembayaran'] ?? 'transfer_manual',
                    'courier' => $data['courier'] ?? null,
                    'courier_service' => $data['courier_service'] ?? null,
                    'ordered_at' => $orderedAt,
                ]);

                foreach ($items as $item) {
                    $orderItem = $order->items()->create([
                        'product_id' => $item['product_id'],
                        'jumlah' => $item['qty'],
                        'harga_satuan' => $item['price'],
                        'total_harga' => $item['price'] * $item['qty'],
                        'harga_tingkat_id' => null,
                    ]);

                    if (! empty($item['batches'])) {
                        $this->allocationService->allocateSpecificBatches($orderItem, $item['batches'], true);
                    }
                }

                if ($shouldAllocate) {
                    $this->allocationService->allocate($order->id);
                }

                return $order->fresh(['items.product', 'items.batches.batch', 'user']);
            });
        } catch (InsufficientStockException $e) {
            return $this->fail($e->getMessage(), 422);
        } catch (\InvalidArgumentException $e) {
            return $this->fail($e->getMessage(), 422);
        }

        return $this->success($order, 'Pesanan manual berhasil dibuat', 201);
    }

    /**
     * @OA\Get(
     *     path="/admin/orders/{id}",
     *     tags={"Admin"},
     *     summary="Detail order untuk admin",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detail order"),
     *     @OA\Response(response=404, description="Order tidak ditemukan")
     * )
     */
    public function show(int $id)
    {
        $this->authorize('admin');

        $order = Order::with(['user', 'items.product', 'items.batches.batch'])->findOrFail($id);

        return $this->success($order);
    }

    /**
     * @OA\Post(
     *     path="/admin/orders/{id}/verify-payment",
     *     tags={"Admin"},
     *     summary="Verifikasi pembayaran dan alokasi batch",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Order dialokasikan"),
     *     @OA\Response(response=422, description="Status tidak valid")
     * )
     */
    public function verifyPayment(Request $request, int $orderId)
    {
        $this->authorize('admin');

        $order = Order::with('items')->findOrFail($orderId);

        if (! in_array($order->status, ['belum_dibayar', 'menunggu_konfirmasi'], true)) {
            return $this->fail('Status order tidak valid untuk verifikasi', 422);
        }

        DB::transaction(function () use ($order) {
            $this->allocationService->allocate($order->id);
            $order->status = 'diproses';
            $order->save();
        });

        return $this->success($order->fresh(['items.batches.batch']), 'Order verified and allocated');
    }

    /**
     * @OA\Post(
     *     path="/admin/orders/{id}/ship",
     *     tags={"Admin"},
     *     summary="Input resi pengiriman",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"resi"},
     *             @OA\Property(property="resi", type="string", example="JNE123456")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Order dikirim")
     * )
     */
    public function ship(Request $request, int $orderId)
    {
        $this->authorize('admin');

        $order = Order::findOrFail($orderId);

        $data = $request->validate([
            'resi' => ['required', 'string', 'max:100'],
        ]);

        $order->resi = $data['resi'];
        $order->status = 'dikirim';
        $order->save();

        SendOrderShippedNotificationJob::dispatch($order->id);

        return $this->success($order, 'Order diperbarui menjadi dikirim');
    }

    /**
     * @OA\Post(
     *     path="/admin/orders/{id}/mark-delivered",
     *     tags={"Admin"},
     *     summary="Tandai pesanan sudah diterima pelanggan",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Order ditandai selesai"),
     *     @OA\Response(response=422, description="Status tidak valid untuk diselesaikan")
     * )
     */
    public function markDelivered(Request $request, int $orderId)
    {
        $this->authorize('admin');

        $order = Order::findOrFail($orderId);

        if ($order->status === 'selesai') {
            return $this->success($order, 'Order sudah berstatus selesai');
        }

        if (! in_array($order->status, ['dikirim', 'diproses', 'menunggu_konfirmasi'], true)) {
            return $this->fail('Status order tidak valid untuk ditandai selesai', 422);
        }

        $order->status = 'selesai';
        $order->tracking_status = $order->tracking_status ?? 'DELIVERED';
        $order->tracking_last_checked_at = now();
        $order->tracking_completed_at = now();
        $order->save();

        return $this->success($order->fresh(), 'Order ditandai selesai');
    }

    /**
     * @OA\Post(
     *     path="/admin/run-reservation-release",
     *     tags={"Admin"},
     *     summary="Trigger job pelepasan reservasi stok",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Job dikirim ke antrean")
     * )
     */
    public function runReservationRelease()
    {
        $this->authorize('admin');

        ReleaseExpiredReservationJob::dispatch();

        return $this->success(null, 'Job release reservasi sudah dijalankan');
    }
}

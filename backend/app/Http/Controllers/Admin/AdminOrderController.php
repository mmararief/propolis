<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Controller;
use App\Jobs\ReleaseExpiredReservationJob;
use App\Jobs\SendOrderShippedNotificationJob;
use App\Jobs\SyncShipmentTrackingJob;
use App\Models\Order;
use App\Models\OrderItemProductCode;
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

        $orders = Order::with(['user', 'items.product', 'items.productVariant', 'items.productVariantPack'])
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
            'items.*.product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.product_variant_pack_id' => ['nullable', 'exists:product_variant_packs,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.kode_produk' => ['nullable', 'array'],
            'items.*.kode_produk.*' => ['nullable', 'string', 'max:100'],
        ], [], [
            'customer.name' => 'nama customer',
            'customer.phone' => 'telepon customer',
            'customer.address' => 'alamat customer',
        ]);

        $items = collect($data['items'])->map(function ($item) {
            return [
                'product_id' => (int) $item['product_id'],
                'product_variant_id' => !empty($item['product_variant_id']) ? (int) $item['product_variant_id'] : null,
                'product_variant_pack_id' => !empty($item['product_variant_pack_id']) ? (int) $item['product_variant_pack_id'] : null,
                'qty' => (int) $item['qty'],
                'price' => (float) $item['price'],
                'codes' => collect($item['kode_produk'] ?? [])
                    ->map(fn($code) => trim((string) $code))
                    ->filter()
                    ->values()
                    ->all(),
            ];
        });

        $items->each(function ($item, $index) {
            if (! empty($item['codes']) && count($item['codes']) !== $item['qty']) {
                throw new \InvalidArgumentException("Jumlah kode produk pada item ke-" . ($index + 1) . " harus sama dengan qty");
            }
        });

        $allCodes = $items->flatMap(fn($item) => $item['codes'])->filter()->values();
        if ($allCodes->count() !== $allCodes->unique()->count()) {
            throw new \InvalidArgumentException('Kode produk tidak boleh duplikat dalam satu permintaan');
        }

        if ($allCodes->isNotEmpty()) {
            $conflictCount = OrderItemProductCode::whereIn('kode_produk', $allCodes)->count();
            if ($conflictCount > 0) {
                throw new \InvalidArgumentException('Beberapa kode produk sudah digunakan pada pesanan lain');
            }
        }

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
                        'product_variant_id' => $item['product_variant_id'],
                        'product_variant_pack_id' => $item['product_variant_pack_id'],
                        'jumlah' => $item['qty'],
                        'harga_satuan' => $item['price'],
                        'total_harga' => $item['price'] * $item['qty'],
                    ]);

                    if (! empty($item['codes'])) {
                        $this->syncItemProductCodes($orderItem, $item['codes']);
                    }
                }

                if ($shouldAllocate) {
                    $this->allocationService->allocate($order->id);
                }

                return $order->fresh(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes', 'user']);
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

        $order = Order::with(['user', 'items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes'])->findOrFail($id);

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

        return $this->success($order->fresh(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes']), 'Order verified and allocated');
    }

    /**
     * @OA\Post(
     *     path="/admin/orders/{id}/product-codes",
     *     tags={"Admin"},
     *     summary="Input atau perbarui kode produk untuk setiap item order",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"items"},
     *             @OA\Property(
     *                 property="items",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     required={"order_item_id","kode_produk"},
     *                     @OA\Property(property="order_item_id", type="integer", example=1),
     *                     @OA\Property(
     *                         property="kode_produk",
     *                         type="array",
     *                         @OA\Items(type="string", example="PROD-001")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=200, description="Kode produk diperbarui"),
     *     @OA\Response(response=404, description="Order tidak ditemukan"),
     *     @OA\Response(response=422, description="Validasi kode produk gagal atau order sudah dikirim")
     * )
     */
    public function updateProductCodes(Request $request, int $orderId)
    {
        $this->authorize('admin');

        /** @var Order $order */
        $order = Order::with('items')->findOrFail($orderId);

        if ($order->status === 'dikirim' || $order->status === 'selesai') {
            return $this->fail('Kode produk tidak dapat diubah setelah order dikirim', 422);
        }

        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.order_item_id' => ['required', 'integer'],
            'items.*.kode_produk' => ['required', 'array', 'min:1'],
            'items.*.kode_produk.*' => ['required', 'string', 'max:100'],
        ]);

        $orderItems = $order->items->keyBy('id');
        $payloadItemIds = collect($data['items'])->pluck('order_item_id')->all();

        foreach ($payloadItemIds as $itemId) {
            if (! $orderItems->has($itemId)) {
                return $this->fail('Item pesanan tidak valid untuk order ini', 422);
            }
        }

        $formattedItems = collect($data['items'])->map(function ($item) {
            $codes = collect($item['kode_produk'])
                ->map(fn($code) => trim((string) $code))
                ->filter()
                ->values();

            return [
                'order_item_id' => (int) $item['order_item_id'],
                'kode_produk' => $codes->all(),
            ];
        });

        $allCodes = $formattedItems->flatMap(fn($item) => $item['kode_produk'])->values();

        if ($allCodes->isEmpty()) {
            return $this->fail('Kode produk wajib diisi', 422);
        }

        if ($allCodes->count() !== $allCodes->unique()->count()) {
            return $this->fail('Kode produk tidak boleh duplikat dalam satu order', 422);
        }

        $existingConflicts = OrderItemProductCode::whereIn('kode_produk', $allCodes)
            ->whereNotIn('order_item_id', $payloadItemIds)
            ->exists();

        if ($existingConflicts) {
            return $this->fail('Beberapa kode produk sudah dipakai pada pesanan lain', 422);
        }

        foreach ($formattedItems as $itemPayload) {
            $orderItem = $orderItems->get($itemPayload['order_item_id']);
            if (count($itemPayload['kode_produk']) !== (int) $orderItem->jumlah) {
                return $this->fail(
                    "Jumlah kode produk untuk {$orderItem->product?->nama_produk} harus {$orderItem->jumlah}",
                    422
                );
            }
        }

        DB::transaction(function () use ($formattedItems, $orderItems) {
            foreach ($formattedItems as $itemPayload) {
                $this->syncItemProductCodes($orderItems->get($itemPayload['order_item_id']), $itemPayload['kode_produk']);
            }
        });

        return $this->success(
            $order->fresh(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes']),
            'Kode produk berhasil disimpan'
        );
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

        $order = Order::with('items.productCodes')->findOrFail($orderId);

        if ($order->status !== 'diproses') {
            return $this->fail('Kode produk harus dilengkapi saat status diproses sebelum dikirim', 422);
        }

        $missingCodes = $order->items->first(function ($item) {
            return $item->productCodes->count() !== $item->jumlah;
        });

        if ($missingCodes) {
            return $this->fail(
                "Lengkapi kode produk untuk {$missingCodes->product?->nama_produk} sebelum mengirim pesanan",
                422
            );
        }

        $data = $request->validate([
            'resi' => ['required', 'string', 'max:100'],
        ]);

        $order->resi = $data['resi'];
        $order->status = 'dikirim';
        $order->save();

        SendOrderShippedNotificationJob::dispatch($order->id);

        return $this->success($order->fresh(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes']), 'Order diperbarui menjadi dikirim');
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

        return $this->success($order->fresh(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes']), 'Order ditandai selesai');
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

    /**
     * @OA\Post(
     *     path="/admin/run-tracking-sync",
     *     tags={"Admin"},
     *     summary="Trigger sync tracking shipment untuk semua order yang perlu di-update",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="limit", in="query", @OA\Schema(type="integer"), description="Maximum orders to sync (default: 50)"),
     *     @OA\Parameter(name="order_id", in="query", @OA\Schema(type="integer"), description="Sync specific order ID only"),
     *     @OA\Response(response=200, description="Job sync tracking sudah dijalankan")
     * )
     */
    public function runTrackingSync(Request $request)
    {
        $this->authorize('admin');

        $limit = $request->integer('limit', 50);
        $orderId = $request->integer('order_id');

        // Jika order_id diberikan, sync order tersebut saja
        if ($orderId) {
            $order = Order::find($orderId);
            if (!$order) {
                return $this->error('Order tidak ditemukan', 404);
            }
            if (empty($order->resi)) {
                return $this->error('Order tidak memiliki nomor resi', 400);
            }

            SyncShipmentTrackingJob::dispatch($order->id);

            return $this->success(null, 'Job sync tracking untuk order #' . $orderId . ' sudah dijalankan');
        }

        // Sync semua order yang perlu di-update
        $intervalHours = (int) config('services.tracking.refresh_interval_hours', 12);

        $orders = Order::query()
            ->whereNotNull('resi')
            ->whereIn('status', ['dikirim', 'diproses'])
            ->where(function ($query) use ($intervalHours) {
                $query
                    ->whereNull('tracking_last_checked_at')
                    ->orWhere('tracking_last_checked_at', '<=', now()->subHours($intervalHours));
            })
            ->orderByRaw('COALESCE(tracking_last_checked_at, "1970-01-01") asc')
            ->limit($limit)
            ->get();

        if ($orders->isEmpty()) {
            return $this->success(null, 'Tidak ada order yang perlu di-sync tracking');
        }

        foreach ($orders as $order) {
            SyncShipmentTrackingJob::dispatch($order->id);
        }

        return $this->success([
            'orders_count' => $orders->count(),
        ], sprintf('Job sync tracking untuk %d order sudah dijalankan', $orders->count()));
    }

    /**
     * @OA\Post(
     *     path="/admin/orders/{id}/cancel",
     *     tags={"Admin"},
     *     summary="Batalkan pesanan oleh admin",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Pesanan dibatalkan"),
     *     @OA\Response(response=422, description="Status tidak valid untuk dibatalkan")
     * )
     */
    public function cancel(Request $request, int $orderId)
    {
        $this->authorize('admin');

        /** @var Order $order */
        $order = Order::with(['items'])->findOrFail($orderId);

        $cancellableStatuses = ['belum_dibayar', 'menunggu_konfirmasi', 'diproses'];

        if (! in_array($order->status, $cancellableStatuses)) {
            return $this->fail('Pesanan dengan status ' . $order->status . ' tidak dapat dibatalkan', 422);
        }

        // Jika order sudah dialokasikan batch, lepas allokasi (kembalikan qty_remaining)
        // Jika masih reservasi, lepas reservasi saja
        if ($order->items->isNotEmpty()) {
            $hasAllocatedItems = $order->items->some(fn($item) => $item->allocated);

            if ($hasAllocatedItems) {
                $this->allocationService->releaseAllocation($order);
            } else {
                $this->allocationService->releaseReservation($order);
            }
        }

        $order->status = 'dibatalkan';
        $order->save();

        return $this->success($order->fresh(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes']), 'Pesanan berhasil dibatalkan');
    }

    private function syncItemProductCodes($orderItem, array $codes): void
    {
        OrderItemProductCode::where('order_item_id', $orderItem->id)->delete();

        foreach ($codes as $index => $code) {
            OrderItemProductCode::create([
                'order_item_id' => $orderItem->id,
                'kode_produk' => $code,
                'sequence' => $index + 1,
            ]);
        }
    }
}

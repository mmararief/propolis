<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PriceTier;
use App\Models\Product;
use App\Services\BatchAllocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Annotations as OA;

class CheckoutController extends Controller
{
    public function __construct(private readonly BatchAllocationService $allocationService) {}

    /**
     * @OA\Post(
     *     path="/checkout",
     *     tags={"Orders"},
     *     summary="Checkout dan reservasi batch",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(ref="#/components/schemas/CheckoutRequest")
     *     ),
     *     @OA\Response(response=200, description="Order berhasil dibuat"),
     *     @OA\Response(response=401, description="Tidak terautentikasi"),
     *     @OA\Response(response=422, description="Stok tidak mencukupi")
     * )
     */
    public function __invoke(Request $request)
    {
        $data = $request->validate([
            'courier' => ['nullable', 'string', 'max:50'],
            'courier_service' => ['nullable', 'string', 'max:50'],
            'origin_city_id' => ['nullable', 'integer'],
            'destination_city_id' => ['nullable', 'integer'],
            'destination_district_id' => ['nullable', 'integer'],
            'destination_subdistrict_id' => ['nullable', 'integer'],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:20'],
            'metode_pembayaran' => ['required', 'in:BCA,BSI,gopay,dana,transfer_manual'],
            'ongkos_kirim' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
            'items.*.harga_tingkat_id' => ['nullable', 'integer'],
            'items.*.catatan' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();

        if (! $user) {
            return $this->fail('User harus login untuk checkout', 401);
        }

        $primaryAddress = $user->addresses()->first();
        $destinationCityId = $data['destination_city_id'] ?? $primaryAddress?->city_id;
        $destinationDistrictId = $data['destination_district_id'] ?? $primaryAddress?->district_id;
        $destinationSubdistrictId = $data['destination_subdistrict_id'] ?? $primaryAddress?->subdistrict_id;
        $addressText = $data['address'] ?? $primaryAddress?->address ?? $user->alamat_lengkap;
        $phone = $data['phone'] ?? $primaryAddress?->phone ?? $user->no_hp;

        if (! $destinationCityId || ! $addressText || ! $phone) {
            return $this->fail('Alamat tujuan belum lengkap. Lengkapi profil/registrasi terlebih dahulu.', 422);
        }

        try {
            $order = DB::transaction(function () use ($user, $data, $destinationCityId, $destinationDistrictId, $destinationSubdistrictId, $addressText, $phone, $primaryAddress) {
                $pricing = $this->calculatePricing($data['items']);
                $shippingCost = $data['ongkos_kirim'] ?? 0;
                $total = $pricing['subtotal'] + $shippingCost;

                $order = Order::create([
                    'user_id' => $user->id,
                    'customer_id' => $user->id,
                    'channel' => 'online',
                    'ordered_at' => now(),
                    'subtotal' => $pricing['subtotal'],
                    'ongkos_kirim' => $shippingCost,
                    'total' => $total,
                    'gross_revenue' => $pricing['subtotal'],
                    'net_revenue' => $total,
                    'discount' => 0,
                    'courier' => $data['courier'] ?? null,
                    'courier_service' => $data['courier_service'] ?? null,
                    'destination_province_id' => $primaryAddress?->provinsi_id,
                    'destination_province_name' => $primaryAddress?->provinsi_name,
                    'destination_city_id' => $destinationCityId,
                    'destination_city_name' => $primaryAddress?->city_name,
                    'destination_district_id' => $destinationDistrictId,
                    'destination_district_name' => $primaryAddress?->district_name,
                    'destination_subdistrict_id' => $destinationSubdistrictId,
                    'destination_subdistrict_name' => $primaryAddress?->subdistrict_name,
                    'destination_postal_code' => $primaryAddress?->postal_code,
                    'address' => $addressText,
                    'phone' => $phone,
                    'status' => 'belum_dibayar',
                    'metode_pembayaran' => $data['metode_pembayaran'],
                ]);

                foreach ($pricing['items'] as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'harga_satuan' => $item['harga_satuan'],
                        'jumlah' => $item['jumlah'],
                        'total_harga' => $item['total'],
                        'catatan' => $item['catatan'],
                        'harga_tingkat_id' => $item['harga_tingkat_id'],
                    ]);
                }

                $order->load('items');

                $this->allocationService->reserveForOrder($order);

                return $order->fresh(['items.batches.batch']);
            });
        } catch (InsufficientStockException $e) {
            return $this->fail($e->getMessage(), 422);
        }

        return $this->success($order, 'Order berhasil dibuat dan stok sudah di-reserve');
    }

    private function calculatePricing(array $items): array
    {
        $result = [
            'subtotal' => 0,
            'items' => [],
        ];

        foreach ($items as $payload) {
            /** @var Product $product */
            $product = Product::findOrFail($payload['product_id']);
            $qty = (int) $payload['jumlah'];
            $tier = null;

            // If a specific tier ID is provided, check global tiers
            if (! empty($payload['harga_tingkat_id'])) {
                $tier = PriceTier::global()
                    ->where('id', $payload['harga_tingkat_id'])
                    ->first();
            }

            // If no tier found yet, find matching global tier based on quantity
            if (! $tier) {
                $tier = PriceTier::global()
                    ->where('min_jumlah', '<=', $qty)
                    ->where(function ($query) use ($qty) {
                        $query->whereNull('max_jumlah')
                            ->orWhere('max_jumlah', '>=', $qty);
                    })
                    ->orderByDesc('min_jumlah')
                    ->first();
            }

            // harga_total adalah total harga untuk min_jumlah item, jadi hitung harga per item
            if ($tier) {
                $hargaSatuan = $tier->harga_total / $tier->min_jumlah;
            } else {
                $hargaSatuan = $product->harga_ecer;
            }
            $total = $hargaSatuan * $qty;

            $result['items'][] = [
                'product_id' => $product->id,
                'harga_satuan' => $hargaSatuan,
                'jumlah' => $qty,
                'total' => $total,
                'catatan' => $payload['catatan'] ?? null,
                'harga_tingkat_id' => $tier?->id,
            ];

            $result['subtotal'] += $total;
        }

        return $result;
    }
}

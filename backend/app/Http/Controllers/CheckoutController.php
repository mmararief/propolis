<?php

namespace App\Http\Controllers;

use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductVariantPack;
use App\Services\BatchAllocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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
            'items.*.jumlah' => ['nullable', 'integer', 'min:1'],
            'items.*.product_variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.product_variant_pack_id' => ['nullable', 'exists:product_variant_packs,id'],
            'items.*.pack_qty' => ['nullable', 'integer', 'min:1'],
            'items.*.catatan' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();

        if (! $user) {
            return $this->fail('User harus login untuk checkout', 401);
        }

        // Use address data directly from user table
        $destinationCityId = $data['destination_city_id'] ?? $user->city_id;
        $destinationDistrictId = $data['destination_district_id'] ?? $user->district_id;
        $destinationSubdistrictId = $data['destination_subdistrict_id'] ?? $user->subdistrict_id;
        $addressText = $data['address'] ?? $user->alamat_lengkap;
        $phone = $data['phone'] ?? $user->no_hp;

        if (! $destinationCityId || ! $addressText || ! $phone) {
            return $this->fail('Alamat tujuan belum lengkap. Lengkapi profil/registrasi terlebih dahulu.', 422);
        }

        try {
            $order = DB::transaction(function () use ($user, $data, $destinationCityId, $destinationDistrictId, $destinationSubdistrictId, $addressText, $phone) {
                $pricing = $this->calculatePricing($data['items']);
                $shippingCost = $data['ongkos_kirim'] ?? 0;
                $total = $pricing['subtotal'] + $shippingCost;

                $order = Order::create([
                    'user_id' => $user->id,
                    'channel' => 'online',
                    'ordered_at' => now(),
                    'subtotal' => $pricing['subtotal'],
                    'ongkos_kirim' => $shippingCost,
                    'total' => $total,
                    'courier' => $data['courier'] ?? null,
                    'courier_service' => $data['courier_service'] ?? null,
                    'destination_province_id' => $user->province_id,
                    'destination_province_name' => $user->provinsi,
                    'destination_city_id' => $destinationCityId,
                    'destination_city_name' => $user->kabupaten_kota,
                    'destination_district_id' => $destinationDistrictId,
                    'destination_district_name' => $user->kecamatan,
                    'destination_subdistrict_id' => $destinationSubdistrictId,
                    'destination_subdistrict_name' => $user->kelurahan,
                    'destination_postal_code' => $user->kode_pos,
                    'address' => $addressText,
                    'phone' => $phone,
                    'status' => 'belum_dibayar',
                    'metode_pembayaran' => $data['metode_pembayaran'],
                ]);

                foreach ($pricing['items'] as $item) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $item['product_id'],
                        'product_variant_id' => $item['product_variant_id'] ?? null,
                        'product_variant_pack_id' => $item['product_variant_pack_id'] ?? null,
                        'harga_satuan' => $item['harga_satuan'],
                        'jumlah' => $item['jumlah'],
                        'total_harga' => $item['total'],
                        'catatan' => $item['catatan'],
                    ]);
                }

                $order->load('items');

                $this->allocationService->reserveForOrder($order);

                return $order->fresh(['items.product', 'items.productVariant', 'items.productVariantPack', 'items.productCodes']);
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
            $variant = null;
            $pack = null;

            if (! empty($payload['product_variant_id'])) {
                $variant = ProductVariant::where('product_id', $product->id)
                    ->findOrFail($payload['product_variant_id']);
            }

            if (! empty($payload['product_variant_pack_id'])) {
                $pack = ProductVariantPack::findOrFail($payload['product_variant_pack_id']);

                // Case 1: Pack langsung dari produk (tanpa variant)
                if ($pack->product_id && !$pack->product_variant_id) {
                    // Pastikan pack sesuai dengan produk
                    if ((int) $pack->product_id !== (int) $product->id) {
                        throw ValidationException::withMessages([
                            'items' => ['Paket tidak sesuai dengan produk yang dipilih.'],
                        ]);
                    }
                    // Untuk pack langsung dari product, variant tetap null
                }
                // Case 2: Pack dari variant
                else if ($pack->product_variant_id) {
                    if ($variant && (int) $pack->product_variant_id !== (int) $variant->id) {
                        throw ValidationException::withMessages([
                            'items' => ['Varian jumlah tidak sesuai dengan varian produk.'],
                        ]);
                    }

                    // Jika variant belum di-load, load dari pack
                    if (! $variant) {
                        $variant = ProductVariant::findOrFail($pack->product_variant_id);

                        if ((int) $variant->product_id !== (int) $product->id) {
                            throw ValidationException::withMessages([
                                'items' => ['Varian jumlah tidak sesuai dengan produk yang dipilih.'],
                            ]);
                        }
                    }
                }
            }

            // Validasi variant jika ada
            if ($variant && (int) $variant->product_id !== (int) $product->id) {
                throw ValidationException::withMessages([
                    'items' => ['Varian yang dipilih tidak sesuai dengan produk.'],
                ]);
            }

            if ($pack) {
                // Gunakan harga dari pack
                $packQty = max(1, (int) ($payload['pack_qty'] ?? 1));
                $qty = $pack->pack_size * $packQty;
                $packHarga = $pack->harga_pack ?? ($variant?->getEffectivePrice() ?? $product->harga_ecer) * $pack->pack_size;
                $total = $packHarga * $packQty;
                $hargaSatuan = $total / $qty;
            } else {
                // Gunakan harga dari variant (atau product jika tidak ada variant)
                $qty = (int) ($payload['jumlah'] ?? 0);

                if ($qty <= 0) {
                    throw ValidationException::withMessages([
                        'items' => ['Jumlah produk harus lebih dari 0.'],
                    ]);
                }

                $hargaSatuan = $variant?->getEffectivePrice() ?? $product->harga_ecer;
                $total = $hargaSatuan * $qty;
            }

            $result['items'][] = [
                'product_id' => $product->id,
                'product_variant_id' => $variant?->id,
                'product_variant_pack_id' => $pack?->id,
                'harga_satuan' => $hargaSatuan,
                'jumlah' => $qty,
                'total' => $total,
                'catatan' => $payload['catatan'] ?? null,
            ];

            $result['subtotal'] += $total;
        }

        return $result;
    }
}

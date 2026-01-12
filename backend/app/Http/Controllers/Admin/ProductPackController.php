<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariantPack;
use App\Services\StockMovementService;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class ProductPackController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/products/{productId}/packs",
     *     tags={"Admin"},
     *     summary="Daftar paket langsung dari produk (tanpa variant)",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Daftar paket produk")
     * )
     */
    public function index(int $productId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);

        // Pastikan produk tidak punya variants
        if ($product->variants()->exists()) {
            return $this->fail('Produk ini memiliki varian. Gunakan endpoint variant packs untuk mengelola paket varian.', 422);
        }

        return $this->success($product->packs()->orderBy('pack_size')->get());
    }

    /**
     * @OA\Post(
     *     path="/admin/products/{productId}/packs",
     *     tags={"Admin"},
     *     summary="Tambah paket langsung dari produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"pack_size"},
     *             @OA\Property(property="label", type="string"),
     *             @OA\Property(property="pack_size", type="integer", example=3),
     *             @OA\Property(property="harga_pack", type="number", format="float"),
     *             @OA\Property(property="status", type="string", enum={"aktif","nonaktif"})
     *         )
     *     ),
     *     @OA\Response(response=201, description="Paket produk dibuat")
     * )
     */
    public function store(Request $request, int $productId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);

        // Pastikan produk tidak punya variants
        if ($product->variants()->exists()) {
            return $this->fail('Produk ini memiliki varian. Gunakan endpoint variant packs untuk mengelola paket varian.', 422);
        }

        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'pack_size' => ['required', 'integer', 'min:1'],
            'sku_pack' => ['nullable', 'string', 'max:50', 'unique:product_variant_packs,sku_pack'],
            'harga_pack' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
        ]);

        // Stok pack selalu 0, stok diambil langsung dari produk
        $pack = ProductVariantPack::create([
            'product_id' => $productId,
            'product_variant_id' => null,
            ...$data,
            'status' => $data['status'] ?? 'aktif',
        ]);

        return $this->success($pack->fresh(), 'Paket produk berhasil dibuat', 201);
    }

    /**
     * @OA\Put(
     *     path="/admin/products/{productId}/packs/{packId}",
     *     tags={"Admin"},
     *     summary="Perbarui paket produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="packId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="label", type="string"),
     *             @OA\Property(property="pack_size", type="integer"),
     *             @OA\Property(property="harga_pack", type="number", format="float"),
     *             @OA\Property(property="status", type="string", enum={"aktif","nonaktif"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Paket produk diperbarui")
     * )
     */
    public function update(Request $request, int $productId, int $packId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $pack = ProductVariantPack::where('product_id', $productId)
            ->whereNull('product_variant_id')
            ->findOrFail($packId);

        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'pack_size' => ['required', 'integer', 'min:1'],
            'sku_pack' => ['nullable', 'string', 'max:50', 'unique:product_variant_packs,sku_pack,' . $pack->id],
            'harga_pack' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
        ]);

        $pack->update($data);

        return $this->success($pack->fresh(), 'Paket produk berhasil diperbarui');
    }

    /**
     * @OA\Delete(
     *     path="/admin/products/{productId}/packs/{packId}",
     *     tags={"Admin"},
     *     summary="Hapus paket produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="packId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Paket produk dihapus")
     * )
     */
    public function destroy(int $productId, int $packId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $pack = ProductVariantPack::where('product_id', $productId)
            ->whereNull('product_variant_id')
            ->findOrFail($packId);

        $pack->delete();

        return $this->success(null, 'Paket produk berhasil dihapus');
    }
}

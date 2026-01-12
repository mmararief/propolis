<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductVariantPack;
use App\Services\StockMovementService;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class ProductVariantPackController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/products/{productId}/variants/{variantId}/packs",
     *     tags={"Admin"},
     *     summary="Daftar varian jumlah untuk varian produk tertentu",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="variantId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Daftar varian jumlah")
     * )
     */
    public function index(int $productId, int $variantId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $variant = $product->variants()->findOrFail($variantId);

        return $this->success($variant->packs()->orderBy('pack_size')->get());
    }

    /**
     * @OA\Post(
     *     path="/admin/products/{productId}/variants/{variantId}/packs",
     *     tags={"Admin"},
     *     summary="Tambah varian jumlah baru",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="variantId", in="path", required=true, @OA\Schema(type="integer")),
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
     *     @OA\Response(response=201, description="Varian jumlah dibuat")
     * )
     */
    public function store(Request $request, int $productId, int $variantId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $variant = $product->variants()->findOrFail($variantId);

        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'pack_size' => ['required', 'integer', 'min:1'],
            'sku_pack' => ['nullable', 'string', 'max:50', 'unique:product_variant_packs,sku_pack'],
            'harga_pack' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
        ]);

        // Stok pack dari variant dihitung dari stok variant (tidak memiliki stok sendiri)
        // Stok pack langsung dari produk menggunakan stok produk
        $pack = $variant->packs()->create([
            ...$data,
            'status' => $data['status'] ?? 'aktif',
        ]);

        return $this->success($pack->fresh(), 'Varian jumlah berhasil dibuat', 201);
    }

    /**
     * @OA\Put(
     *     path="/admin/products/{productId}/variants/{variantId}/packs/{packId}",
     *     tags={"Admin"},
     *     summary="Perbarui varian jumlah",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="variantId", in="path", required=true, @OA\Schema(type="integer")),
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
     *     @OA\Response(response=200, description="Varian jumlah diperbarui")
     * )
     */
    public function update(Request $request, int $productId, int $variantId, int $packId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $variant = $product->variants()->findOrFail($variantId);
        $pack = $variant->packs()->findOrFail($packId);

        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'pack_size' => ['sometimes', 'integer', 'min:1'],
            'sku_pack' => ['nullable', 'string', 'max:50', 'unique:product_variant_packs,sku_pack,' . $pack->id],
            'harga_pack' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
        ]);

        $pack->fill($data);
        $pack->save();

        return $this->success($pack->fresh(), 'Varian jumlah berhasil diperbarui');
    }

    /**
     * @OA\Delete(
     *     path="/admin/products/{productId}/variants/{variantId}/packs/{packId}",
     *     tags={"Admin"},
     *     summary="Hapus varian jumlah",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="variantId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="packId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Varian jumlah dihapus")
     * )
     */
    public function destroy(int $productId, int $variantId, int $packId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $variant = $product->variants()->findOrFail($variantId);
        $pack = $variant->packs()->findOrFail($packId);

        $pack->delete();

        return $this->success(null, 'Varian jumlah berhasil dihapus');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\StockMovementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Annotations as OA;

class ProductVariantController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/products/{productId}/variants",
     *     tags={"Admin"},
     *     summary="Daftar varian produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Daftar varian produk")
     * )
     */
    public function index(int $productId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $variants = $product->variants()->with('packs')->orderBy('tipe')->get();

        return $this->success($variants);
    }

    /**
     * @OA\Post(
     *     path="/admin/products/{productId}/variants",
     *     tags={"Admin"},
     *     summary="Tambah varian produk baru",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"tipe"},
     *             @OA\Property(property="tipe", type="string", example="BP REGULER (dewasa)"),
     *             @OA\Property(property="sku_variant", type="string", nullable=true),
     *             @OA\Property(property="stok", type="integer", nullable=true),
     *             @OA\Property(property="harga_ecer", type="number", format="float", nullable=true),
     *             @OA\Property(property="gambar", type="array", nullable=true, @OA\Items(type="string")),
     *             @OA\Property(property="status", type="string", enum={"aktif","nonaktif"}, nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Varian produk berhasil dibuat")
     * )
     */
    public function store(Request $request, int $productId)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);

        $data = $request->validate([
            'tipe' => ['required', 'string', 'max:100'],
            'sku_variant' => ['nullable', 'string', 'max:50', 'unique:product_variants,sku_variant'],
            'stok' => ['nullable', 'integer', 'min:0'],
            'harga_ecer' => ['nullable', 'numeric', 'min:0'],
            'gambar' => ['nullable', 'array'],
            'gambar.*' => ['nullable', 'string', 'max:255'],
            'gambar_file' => ['nullable', 'array'],
            'gambar_file.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'status' => ['nullable', 'in:aktif,nonaktif'],
        ]);

        // Check if variant with same tipe already exists for this product
        $existingVariant = $product->variants()->where('tipe', $data['tipe'])->first();
        if ($existingVariant) {
            return $this->fail('Varian dengan tipe "' . $data['tipe'] . '" sudah ada untuk produk ini', 422);
        }

        // Handle file uploads
        $uploadedImages = [];
        if ($request->hasFile('gambar_file')) {
            foreach ($request->file('gambar_file') as $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('product-variants', $filename, 'public');
                    $uploadedImages[] = Storage::url($path);
                }
            }
        }

        if (!empty($uploadedImages)) {
            $existingImages = $data['gambar'] ?? [];
            $data['gambar'] = array_merge($existingImages, $uploadedImages);
        } elseif (isset($data['gambar']) && is_array($data['gambar'])) {
            $data['gambar'] = array_filter($data['gambar']);
        } else {
            $data['gambar'] = null;
        }

        $data['product_id'] = $productId;
        $data['stok'] = $data['stok'] ?? 0;
        $data['status'] = $data['status'] ?? 'aktif';

        $variant = ProductVariant::create($data);

        if (($variant->stok ?? 0) > 0) {
            StockMovementService::record(
                $product,
                (int) $variant->stok,
                'initial_stock',
                [
                    'note' => 'Stok awal varian: ' . $variant->tipe,
                    'reference_type' => 'product_variants',
                    'reference_id' => $variant->id,
                ]
            );
        }

        return $this->success($variant->fresh(), 'Varian produk berhasil dibuat', 201);
    }

    /**
     * @OA\Get(
     *     path="/admin/products/{productId}/variants/{id}",
     *     tags={"Admin"},
     *     summary="Detail varian produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Detail varian produk")
     * )
     */
    public function show(int $productId, int $id)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $variant = $product->variants()->findOrFail($id);

        return $this->success($variant);
    }

    /**
     * @OA\Put(
     *     path="/admin/products/{productId}/variants/{id}",
     *     tags={"Admin"},
     *     summary="Perbarui varian produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="tipe", type="string"),
     *             @OA\Property(property="sku_variant", type="string", nullable=true),
     *             @OA\Property(property="stok", type="integer", nullable=true),
     *             @OA\Property(property="harga_ecer", type="number", format="float", nullable=true),
     *             @OA\Property(property="gambar", type="array", nullable=true, @OA\Items(type="string")),
     *             @OA\Property(property="status", type="string", enum={"aktif","nonaktif"}, nullable=true)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Varian produk berhasil diperbarui")
     * )
     */
    public function update(Request $request, int $productId, int $id)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $variant = $product->variants()->findOrFail($id);

        $data = $request->validate([
            'tipe' => ['sometimes', 'string', 'max:100'],
            'sku_variant' => ['nullable', 'string', 'max:50', 'unique:product_variants,sku_variant,' . $id],
            'stok' => ['nullable', 'integer', 'min:0'],
            'harga_ecer' => ['nullable', 'numeric', 'min:0'],
            'gambar' => ['nullable', 'array'],
            'gambar.*' => ['nullable', 'string', 'max:255'],
            'gambar_file' => ['nullable', 'array'],
            'gambar_file.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'gambar_hapus' => ['nullable', 'array'],
            'gambar_hapus.*' => ['nullable', 'string'],
            'status' => ['sometimes', 'in:aktif,nonaktif'],
        ]);

        // Check if tipe is being changed and conflicts with another variant
        if (isset($data['tipe']) && $data['tipe'] !== $variant->tipe) {
            $existingVariant = $product->variants()
                ->where('tipe', $data['tipe'])
                ->where('id', '!=', $id)
                ->first();
            if ($existingVariant) {
                return $this->fail('Varian dengan tipe "' . $data['tipe'] . '" sudah ada untuk produk ini', 422);
            }
        }

        // Handle image deletion
        $currentImages = $variant->gambar ?? [];
        if ($request->has('gambar_hapus') && is_array($request->gambar_hapus)) {
            foreach ($request->gambar_hapus as $imageToDelete) {
                $oldPath = str_replace('/storage/', '', $imageToDelete);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
                $currentImages = array_filter($currentImages, fn($img) => $img !== $imageToDelete);
            }
            $currentImages = array_values($currentImages);
        }

        // Handle file uploads
        $uploadedImages = [];
        if ($request->hasFile('gambar_file')) {
            foreach ($request->file('gambar_file') as $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('product-variants', $filename, 'public');
                    $uploadedImages[] = Storage::url($path);
                }
            }
        }

        if (!empty($uploadedImages)) {
            $data['gambar'] = array_merge($currentImages, $uploadedImages);
        } elseif (isset($data['gambar']) && is_array($data['gambar'])) {
            $data['gambar'] = array_filter($data['gambar']);
        } else {
            $data['gambar'] = !empty($currentImages) ? $currentImages : null;
        }

        $originalStock = (int) $variant->stok;
        $variant->fill($data);
        $variant->save();

        if ($variant->wasChanged('stok')) {
            $stockChange = (int) $variant->stok - $originalStock;
            StockMovementService::record(
                $product,
                $stockChange,
                'manual_adjustment',
                [
                    'note' => 'Perubahan stok varian: ' . $variant->tipe,
                    'reference_type' => 'product_variants',
                    'reference_id' => $variant->id,
                ]
            );
        }

        return $this->success($variant->fresh(), 'Varian produk berhasil diperbarui');
    }

    /**
     * @OA\Delete(
     *     path="/admin/products/{productId}/variants/{id}",
     *     tags={"Admin"},
     *     summary="Hapus varian produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Varian produk berhasil dihapus")
     * )
     */
    public function destroy(int $productId, int $id)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $variant = $product->variants()->findOrFail($id);

        // Delete images if exists
        if ($variant->gambar && is_array($variant->gambar)) {
            foreach ($variant->gambar as $image) {
                $imagePath = str_replace('/storage/', '', $image);
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        $variant->delete();

        return $this->success(null, 'Varian produk berhasil dihapus');
    }

    /**
     * @OA\Post(
     *     path="/admin/products/{productId}/variants/{id}/add-stock",
     *     tags={"Admin"},
     *     summary="Tambah stok varian produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="productId", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"qty"},
     *             @OA\Property(property="qty", type="integer", example=10)
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stok varian berhasil ditambahkan")
     * )
     */
    public function addStock(Request $request, int $productId, int $id)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($productId);
        $variant = $product->variants()->findOrFail($id);

        $data = $request->validate([
            'qty' => ['required', 'integer'],
        ]);

        $newStock = $variant->stok + $data['qty'];

        if ($newStock < 0) {
            return $this->fail('Stok tidak boleh negatif. Stok saat ini: ' . $variant->stok, 422);
        }

        $variant->stok = $newStock;
        $variant->save();

        StockMovementService::record(
            $product,
            (int) $data['qty'],
            'manual_adjustment',
            [
                'note' => 'Penyesuaian stok varian: ' . $variant->tipe,
                'reference_type' => 'product_variants',
                'reference_id' => $variant->id,
            ]
        );

        return $this->success($variant->fresh(), 'Stok varian berhasil diperbarui');
    }
}

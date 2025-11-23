<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Services\StockMovementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Annotations as OA;

class ProductController extends Controller
{
    /**
     * @OA\Get(
     *     path="/products",
     *     tags={"Products"},
     *     summary="Daftar produk",
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter status produk (aktif/nonaktif)",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="kategori_id",
     *         in="query",
     *         description="Filter berdasarkan kategori",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Jumlah item per halaman",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Berhasil memuat produk",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", nullable=true)
     *         )
     *     )
     * )
     */
    public function index(Request $request)
    {
        $products = Product::query()
            ->with(['category']);

        if ($request->boolean('include_variants', false)) {
            $products->with(['variants.packs', 'packs']);
        } else {
            // Eager load variants for stock calculation if not explicitly requested
            $products->with(['variants']);
        }

        if ($request->filled('status')) {
            $products->where('status', $request->string('status'));
        }

        if ($request->filled('kategori_id')) {
            $products->where('kategori_id', $request->integer('kategori_id'));
        }

        $perPage = $request->integer('per_page', $request->integer('limit', 15));

        $result = $products->paginate($perPage);

        // Append stok_available manually to the collection
        $result->getCollection()->each(function ($product) {
            $product->append('stok_available');
        });

        return $this->success($result);
    }

    /**
     * @OA\Get(
     *     path="/categories",
     *     tags={"Products"},
     *     summary="Daftar kategori",
     *     @OA\Response(
     *         response=200,
     *         description="Berhasil memuat kategori",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", nullable=true)
     *         )
     *     )
     * )
     */
    public function categories()
    {
        $categories = Category::orderBy('nama_kategori')->get();

        return $this->success($categories);
    }

    /**
     * @OA\Get(
     *     path="/products/{id}",
     *     tags={"Products"},
     *     summary="Detail produk",
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(
     *         response=200,
     *         description="Detail produk beserta harga tingkat",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean"),
     *             @OA\Property(property="data", type="object"),
     *             @OA\Property(property="message", type="string", nullable=true)
     *         )
     *     )
     * )
     */
    public function show(int $id)
    {
        $product = Product::with(['category', 'variants.packs', 'packs'])->findOrFail($id);

        $product->append('stok_available');
        return $this->success($product);
    }

    /**
     * @OA\Post(
     *     path="/products",
     *     tags={"Products"},
     *     summary="Tambah produk baru",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"kategori_id","sku","nama_produk","harga_ecer","status"},
     *             @OA\Property(property="kategori_id", type="integer"),
     *             @OA\Property(property="sku", type="string"),
     *             @OA\Property(property="nama_produk", type="string"),
     *             @OA\Property(property="tipe", type="string", nullable=true, description="Tipe/varian produk (contoh: BP REGULER, BP KIDS, BP BLUE)"),
     *             @OA\Property(property="deskripsi", type="string", nullable=true),
     *             @OA\Property(property="harga_ecer", type="number", format="float"),
     *             @OA\Property(property="stok", type="integer", nullable=true),
     *             @OA\Property(property="gambar", type="string", nullable=true),
     *             @OA\Property(property="berat", type="integer", nullable=true, description="Berat produk dalam gram"),
     *             @OA\Property(property="status", type="string", enum={"aktif","nonaktif"})
     *         )
     *     ),
     *     @OA\Response(response=201, description="Produk berhasil dibuat")
     * )
     */
    public function store(Request $request)
    {
        $this->authorize('admin');

        $data = $request->validate([
            'kategori_id' => ['required', 'exists:kategori,id'],
            'sku' => ['nullable', 'string', 'max:50', 'unique:products,sku'],
            'nama_produk' => ['required', 'string', 'max:255'],
            'tipe' => ['nullable', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string'],
            'harga_ecer' => ['required', 'numeric', 'min:0'],
            'stok' => ['nullable', 'integer', 'min:0'],
            'gambar' => ['nullable', 'array'],
            'gambar.*' => ['nullable', 'string', 'max:255'],
            'gambar_file' => ['nullable', 'array'],
            'gambar_file.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'berat' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        // Handle multiple file uploads
        $uploadedImages = [];
        if ($request->hasFile('gambar_file')) {
            foreach ($request->file('gambar_file') as $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('products', $filename, 'public');
                    $uploadedImages[] = Storage::url($path);
                }
            }
        }

        // Merge with existing images if provided
        if (!empty($uploadedImages)) {
            $existingImages = $data['gambar'] ?? [];
            $data['gambar'] = array_merge($existingImages, $uploadedImages);
        } elseif (isset($data['gambar']) && is_array($data['gambar'])) {
            // Keep existing images if no new uploads
            $data['gambar'] = array_filter($data['gambar']);
        } else {
            $data['gambar'] = null;
        }

        // Set default berat if not provided
        if (!isset($data['berat']) || empty($data['berat'])) {
            $data['berat'] = 500;
        }

        // Convert empty SKU string to null
        if (isset($data['sku']) && $data['sku'] === '') {
            $data['sku'] = null;
        }

        $product = Product::create($data);

        if (($product->stok ?? 0) > 0) {
            StockMovementService::record(
                $product,
                (int) $product->stok,
                'initial_stock',
                ['note' => 'Stok awal saat membuat produk']
            );
        }

        return $this->success($product->fresh(), 'Produk berhasil dibuat', 201);
    }

    /**
     * @OA\Put(
     *     path="/products/{id}",
     *     tags={"Products"},
     *     summary="Perbarui produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="kategori_id", type="integer"),
     *             @OA\Property(property="sku", type="string"),
     *             @OA\Property(property="nama_produk", type="string"),
     *             @OA\Property(property="tipe", type="string", nullable=true, description="Tipe/varian produk (contoh: BP REGULER, BP KIDS, BP BLUE)"),
     *             @OA\Property(property="deskripsi", type="string"),
     *             @OA\Property(property="harga_ecer", type="number", format="float"),
     *             @OA\Property(property="stok", type="integer"),
     *             @OA\Property(property="gambar", type="string"),
     *             @OA\Property(property="berat", type="integer", description="Berat produk dalam gram"),
     *             @OA\Property(property="status", type="string", enum={"aktif","nonaktif"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Produk diperbarui")
     * )
     */
    public function update(Request $request, int $id)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($id);

        $data = $request->validate([
            'kategori_id' => ['sometimes', 'exists:kategori,id'],
            'sku' => ['nullable', 'string', 'max:50', 'unique:products,sku,' . $product->id],
            'nama_produk' => ['sometimes', 'string', 'max:255'],
            'tipe' => ['nullable', 'string', 'max:100'],
            'deskripsi' => ['nullable', 'string'],
            'harga_ecer' => ['sometimes', 'numeric', 'min:0'],
            'stok' => ['nullable', 'integer', 'min:0'],
            'gambar' => ['nullable', 'array'],
            'gambar.*' => ['nullable', 'string', 'max:255'],
            'gambar_file' => ['nullable', 'array'],
            'gambar_file.*' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'gambar_hapus' => ['nullable', 'array'],
            'gambar_hapus.*' => ['nullable', 'string'],
            'berat' => ['nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:aktif,nonaktif'],
        ]);

        // Handle deletion of images
        $currentImages = $product->gambar ?? [];
        if ($request->has('gambar_hapus') && is_array($request->gambar_hapus)) {
            foreach ($request->gambar_hapus as $imageToDelete) {
                $oldPath = str_replace('/storage/', '', $imageToDelete);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
                $currentImages = array_filter($currentImages, fn($img) => $img !== $imageToDelete);
            }
            $currentImages = array_values($currentImages); // Re-index array
        }

        // Handle multiple file uploads
        $uploadedImages = [];
        if ($request->hasFile('gambar_file')) {
            foreach ($request->file('gambar_file') as $file) {
                if ($file && $file->isValid()) {
                    $filename = time() . '_' . uniqid() . '_' . $file->getClientOriginalName();
                    $path = $file->storeAs('products', $filename, 'public');
                    $uploadedImages[] = Storage::url($path);
                }
            }
        }

        // Merge existing and new images
        if (!empty($uploadedImages)) {
            $data['gambar'] = array_merge($currentImages, $uploadedImages);
        } elseif (isset($data['gambar']) && is_array($data['gambar'])) {
            $data['gambar'] = array_filter($data['gambar']);
        } else {
            $data['gambar'] = !empty($currentImages) ? $currentImages : null;
        }

        // Convert empty SKU string to null
        if (isset($data['sku']) && $data['sku'] === '') {
            $data['sku'] = null;
        }

        $originalStock = (int) $product->stok;

        $product->fill($data);
        $product->save();

        if ($product->wasChanged('stok')) {
            $stockChange = (int) $product->stok - $originalStock;
            StockMovementService::record(
                $product,
                $stockChange,
                'manual_adjustment',
                ['note' => 'Perubahan stok melalui pembaruan produk']
            );
        }

        return $this->success($product->fresh(), 'Produk berhasil diperbarui');
    }

    /**
     * @OA\Post(
     *     path="/products/{id}/add-stock",
     *     tags={"Products"},
     *     summary="Tambah stok produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"qty"},
     *             @OA\Property(property="qty", type="integer", example=10, description="Jumlah stok yang ditambahkan (bisa negatif untuk mengurangi)")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Stok berhasil ditambahkan"),
     *     @OA\Response(response=404, description="Produk tidak ditemukan"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function addStock(Request $request, int $id)
    {
        $this->authorize('admin');

        $product = Product::with('variants')->findOrFail($id);

        // Jika produk sudah punya variant, stok harus dikelola di level variant/pack
        if ($product->variants->isNotEmpty()) {
            return $this->fail('Produk ini sudah memiliki varian. Silakan kelola stok melalui varian atau paket varian.', 422);
        }

        $data = $request->validate([
            'qty' => ['required', 'integer'],
        ]);

        $newStock = $product->stok + $data['qty'];

        // Pastikan stok tidak negatif
        if ($newStock < 0) {
            return $this->fail('Stok tidak boleh negatif. Stok saat ini: ' . $product->stok, 422);
        }

        $product->stok = $newStock;
        $product->save();

        StockMovementService::record(
            $product,
            (int) $data['qty'],
            'manual_adjustment',
            ['note' => 'Penyesuaian stok manual']
        );

        return $this->success($product->fresh(), 'Stok berhasil diperbarui');
    }

    /**
     * @OA\Delete(
     *     path="/products/{id}",
     *     tags={"Products"},
     *     summary="Hapus produk",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Produk dihapus")
     * )
     */
    public function destroy(int $id)
    {
        $this->authorize('admin');

        $product = Product::findOrFail($id);

        // Delete all images if exists
        if ($product->gambar && is_array($product->gambar)) {
            foreach ($product->gambar as $image) {
                $imagePath = str_replace('/storage/', '', $image);
                if (Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        $product->delete();

        return $this->success(null, 'Produk berhasil dihapus');
    }

    /**
     * @OA\Get(
     *     path="/admin/low-stock-products",
     *     tags={"Products"},
     *     summary="Daftar produk dengan stok rendah",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="threshold",
     *         in="query",
     *         description="Ambang batas stok tersedia",
     *         @OA\Schema(type="integer", example=10)
     *     ),
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Jumlah maksimum produk yang dikembalikan (maks 50)",
     *         @OA\Schema(type="integer", example=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Berhasil memuat produk dengan stok rendah"
     *     )
     * )
     */
    public function lowStock(Request $request)
    {
        $this->authorize('admin');

        $threshold = max(0, (int) $request->integer('threshold', 10));
        $limit = (int) $request->integer('limit', 10);
        $limit = $limit > 0 ? min($limit, 50) : 10;

        $availableStockExpression = '(stok - COALESCE(stok_reserved, 0))';

        $products = Product::query()
            ->select(['id', 'nama_produk', 'sku', 'stok', 'stok_reserved'])
            ->doesntHave('variants')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim((string) $request->input('search'));
                $query->where(function ($q) use ($search) {
                    $q->where('nama_produk', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            })
            ->whereRaw("{$availableStockExpression} <= ?", [$threshold])
            ->orderByRaw("{$availableStockExpression} asc")
            ->limit($limit)
            ->get();

        return $this->success($products);
    }
}

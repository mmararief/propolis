<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
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
            ->with(['category'])
            ->withSum('batches as total_qty_remaining', 'qty_remaining')
            ->withSum('batches as total_reserved_qty', 'reserved_qty');

        if ($request->filled('status')) {
            $products->where('status', $request->string('status'));
        }

        if ($request->filled('kategori_id')) {
            $products->where('kategori_id', $request->integer('kategori_id'));
        }

        $perPage = $request->integer('per_page', $request->integer('limit', 15));

        return $this->success($products->paginate($perPage));
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

    public function show(int $id)
    {
        $product = Product::with([
            'category',
            'batches' => function ($query) {
                $query->orderBy('expiry_date')->select([
                    'id',
                    'product_id',
                    'batch_number',
                    'qty_initial',
                    'qty_remaining',
                    'reserved_qty',
                    'expiry_date',
                    'purchase_price',
                ]);
            },
        ])->findOrFail($id);

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
            'sku' => ['required', 'string', 'max:50', 'unique:products,sku'],
            'nama_produk' => ['required', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'harga_ecer' => ['required', 'numeric', 'min:0'],
            'stok' => ['nullable', 'integer', 'min:0'],
            'gambar' => ['nullable', 'string', 'max:255'],
            'gambar_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'berat' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', 'in:aktif,nonaktif'],
        ]);

        // Handle file upload
        if ($request->hasFile('gambar_file')) {
            $file = $request->file('gambar_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('products', $filename, 'public');
            $data['gambar'] = Storage::url($path);
        }

        // Set default berat if not provided
        if (!isset($data['berat']) || empty($data['berat'])) {
            $data['berat'] = 500;
        }

        $product = Product::create($data);

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
            'sku' => ['sometimes', 'string', 'max:50', 'unique:products,sku,' . $product->id],
            'nama_produk' => ['sometimes', 'string', 'max:255'],
            'deskripsi' => ['nullable', 'string'],
            'harga_ecer' => ['sometimes', 'numeric', 'min:0'],
            'stok' => ['nullable', 'integer', 'min:0'],
            'gambar' => ['nullable', 'string', 'max:255'],
            'gambar_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'berat' => ['nullable', 'integer', 'min:1'],
            'status' => ['sometimes', 'in:aktif,nonaktif'],
        ]);

        // Handle file upload
        if ($request->hasFile('gambar_file')) {
            // Delete old image if exists
            if ($product->gambar) {
                $oldPath = str_replace('/storage/', '', $product->gambar);
                Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('gambar_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('products', $filename, 'public');
            $data['gambar'] = Storage::url($path);
        }

        $product->fill($data)->save();

        return $this->success($product->fresh(), 'Produk berhasil diperbarui');
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

        // Delete image if exists
        if ($product->gambar) {
            $imagePath = str_replace('/storage/', '', $product->gambar);
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
        }

        $product->delete();

        return $this->success(null, 'Produk berhasil dihapus');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class CategoryController extends Controller
{
    /**
     * @OA\Get(
     *     path="/admin/categories",
     *     tags={"Admin"},
     *     summary="Daftar semua kategori",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Daftar kategori")
     * )
     */
    public function index()
    {
        $categories = Category::withCount('products')
            ->orderBy('nama_kategori')
            ->get();
        return $this->success($categories);
    }

    /**
     * @OA\Post(
     *     path="/admin/categories",
     *     tags={"Admin"},
     *     summary="Buat kategori baru",
     *     security={{"sanctum": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nama_kategori"},
     *             @OA\Property(property="nama_kategori", type="string", example="Kategori Baru")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Kategori berhasil dibuat"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function store(Request $request)
    {
        $this->authorize('admin');

        $data = $request->validate([
            'nama_kategori' => ['required', 'string', 'max:255', 'unique:kategori,nama_kategori'],
        ]);

        $category = Category::create($data);

        return $this->success($category, 'Kategori berhasil ditambahkan', 201);
    }

    /**
     * @OA\Put(
     *     path="/admin/categories/{id}",
     *     tags={"Admin"},
     *     summary="Update kategori",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nama_kategori"},
     *             @OA\Property(property="nama_kategori", type="string", example="Kategori Updated")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Kategori berhasil diupdate"),
     *     @OA\Response(response=404, description="Kategori tidak ditemukan"),
     *     @OA\Response(response=422, description="Validasi gagal")
     * )
     */
    public function update(Request $request, int $id)
    {
        $this->authorize('admin');

        $category = Category::findOrFail($id);

        $data = $request->validate([
            'nama_kategori' => ['required', 'string', 'max:255', 'unique:kategori,nama_kategori,' . $id],
        ]);

        $category->update($data);

        return $this->success($category->fresh(), 'Kategori berhasil diperbarui');
    }

    /**
     * @OA\Delete(
     *     path="/admin/categories/{id}",
     *     tags={"Admin"},
     *     summary="Hapus kategori",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Kategori berhasil dihapus"),
     *     @OA\Response(response=404, description="Kategori tidak ditemukan"),
     *     @OA\Response(response=422, description="Kategori tidak dapat dihapus karena masih memiliki produk")
     * )
     */
    public function destroy(int $id)
    {
        $this->authorize('admin');

        $category = Category::findOrFail($id);

        // Check if category has products
        if ($category->products()->count() > 0) {
            return $this->fail('Kategori tidak dapat dihapus karena masih memiliki produk', 422);
        }

        $category->delete();

        return $this->success(null, 'Kategori berhasil dihapus');
    }
}

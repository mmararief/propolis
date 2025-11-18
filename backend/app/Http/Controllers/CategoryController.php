<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index()
    {
        $categories = Category::withCount('products')
            ->orderBy('nama_kategori')
            ->get();
        return $this->success($categories);
    }

    /**
     * Create a new category
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
     * Update a category
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
     * Delete a category
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

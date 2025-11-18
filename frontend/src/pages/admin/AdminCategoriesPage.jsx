import { useEffect, useState } from 'react';
import api from '../../api/client';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ nama_kategori: '' });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/admin/categories');
      setCategories(data.data?.data ?? data.data ?? []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, form);
        setMessage('Kategori berhasil diperbarui');
      } else {
        await api.post('/admin/categories', form);
        setMessage('Kategori berhasil ditambahkan');
      }
      setForm({ nama_kategori: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setForm({ nama_kategori: category.nama_kategori });
    setEditingId(category.id);
    setError(null);
    setMessage(null);
  };

  const handleCancel = () => {
    setForm({ nama_kategori: '' });
    setEditingId(null);
    setError(null);
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return;
    }

    try {
      await api.delete(`/admin/categories/${id}`);
      setMessage('Kategori berhasil dihapus');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menghapus kategori');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Kategori</h1>
        <p className="text-sm text-slate-500">Tambah, edit, atau hapus kategori produk.</p>
      </div>

      {/* Form */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nama_kategori" className="block text-sm font-medium text-slate-700 mb-1">
              Nama Kategori
            </label>
            <input
              id="nama_kategori"
              type="text"
              className="input-field"
              value={form.nama_kategori}
              onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })}
              placeholder="Contoh: Propolis, Madu, dll"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Tambah'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Batal
              </button>
            )}
          </div>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
      </div>

      {/* Categories List */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Daftar Kategori</h2>
        {categories.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Belum ada kategori</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="py-2 font-semibold text-slate-900">ID</th>
                  <th className="py-2 font-semibold text-slate-900">Nama Kategori</th>
                  <th className="py-2 font-semibold text-slate-900">Jumlah Produk</th>
                  <th className="py-2 font-semibold text-slate-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-slate-50">
                    <td className="py-3 text-slate-600">#{category.id}</td>
                    <td className="py-3 font-medium text-slate-900">{category.nama_kategori}</td>
                    <td className="py-3 text-slate-600">
                      {category.products_count ?? 0} produk
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn-outline px-3 py-1 text-xs"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-primary px-3 py-1 text-xs bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(category.id)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;


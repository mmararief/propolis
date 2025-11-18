import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { getProductImageUrl } from '../../utils/imageHelper';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products');
      setProducts(data.data?.data ?? data.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal menghapus produk');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Produk</h1>
          <p className="text-sm text-slate-500">Daftar semua produk dan kelola batch stok</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate('/admin/products/new')}
        >
          + Tambah Produk
        </button>
      </div>

      {/* Products List */}
      <div className="card space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              type="button"
              className="btn-primary mt-2"
              onClick={fetchProducts}
            >
              Coba Lagi
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">Belum ada produk</p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/admin/products/new')}
            >
              Tambah Produk Pertama
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-200">
                    <th className="py-3 font-semibold text-slate-900">Gambar</th>
                    <th className="py-3 font-semibold text-slate-900">Nama Produk</th>
                    <th className="py-3 font-semibold text-slate-900">Kategori</th>
                    <th className="py-3 font-semibold text-slate-900">SKU</th>
                    <th className="py-3 font-semibold text-slate-900">Harga</th>
                    <th className="py-3 font-semibold text-slate-900">Stok</th>
                    <th className="py-3 font-semibold text-slate-900">Status</th>
                    <th className="py-3 font-semibold text-slate-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3">
                        {product.gambar ? (
                          <img
                            src={getProductImageUrl(product.gambar)}
                            alt={product.nama_produk}
                            className="w-16 h-16 object-cover rounded border border-slate-200"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-slate-900">{product.nama_produk}</div>
                        {product.deskripsi && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {product.deskripsi}
                          </div>
                        )}
                      </td>
                      <td className="py-3 text-slate-600">
                        {product.category?.nama_kategori || '-'}
                      </td>
                      <td className="py-3 text-slate-600 font-mono text-xs">{product.sku}</td>
                      <td className="py-3">
                        <span className="font-semibold text-slate-900">
                          Rp {Number(product.harga_ecer).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-slate-600">{product.stok ?? 0}</span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`badge-status ${
                            product.status === 'aktif'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="btn-outline px-3 py-1 text-xs"
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-primary px-3 py-1 text-xs bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(product.id)}
                            >
                              Hapus
                            </button>
                          </div>
                          <Link
                            to={`/admin/products/${product.id}/batches`}
                            className="btn-outline px-3 py-1 text-xs text-center"
                          >
                            Kelola Batch
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProductsPage;

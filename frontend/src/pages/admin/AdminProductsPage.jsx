import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { getProductImageUrl } from '../../utils/imageHelper';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockQty, setStockQty] = useState('');
  const [stockLoading, setStockLoading] = useState(false);

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

  const handleOpenStockModal = (product) => {
    setSelectedProduct(product);
    setStockQty('');
    setShowStockModal(true);
  };

  const handleCloseStockModal = () => {
    setShowStockModal(false);
    setSelectedProduct(null);
    setStockQty('');
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !stockQty || stockQty === '0') {
      alert('Masukkan jumlah stok yang valid');
      return;
    }

    setStockLoading(true);
    try {
      await api.post(`/products/${selectedProduct.id}/add-stock`, {
        qty: parseInt(stockQty),
      });
      handleCloseStockModal();
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal menambah stok');
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Produk</h1>
          <p className="text-sm text-slate-500">Daftar semua produk dan pantau stok tersedia.</p>
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
                        <div className="text-slate-600 text-sm">
                          <p>
                            Ready:{' '}
                            <span className="font-semibold text-slate-900">
                              {product.stok_available ?? Math.max(0, (product.stok ?? 0) - (product.stok_reserved ?? 0))}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500">
                            Reserved: {product.stok_reserved ?? 0} | Total: {product.stok ?? 0}
                          </p>
                        </div>
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
                            className="btn-primary px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleOpenStockModal(product)}
                          >
                            + Stok
                          </button>
                          <button
                            type="button"
                            className="btn-primary px-3 py-1 text-xs bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(product.id)}
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
          </>
        )}
      </div>

      {/* Modal Tambah Stok */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Tambah Stok Produk
            </h2>
            <p className="text-sm text-slate-600 mb-2">
              <strong>{selectedProduct.nama_produk}</strong>
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Stok saat ini: <strong>{selectedProduct.stok ?? 0}</strong>
            </p>
            <form onSubmit={handleAddStock}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah Stok <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="input-field w-full"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value)}
                  placeholder="Masukkan jumlah stok"
                  required
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-1">
                  Masukkan angka positif untuk menambah, angka negatif untuk mengurangi
                </p>
                {stockQty && parseInt(stockQty) !== 0 && (
                  <p className="text-sm mt-2">
                    Stok setelah perubahan:{' '}
                    <strong className="text-blue-600">
                      {(selectedProduct.stok ?? 0) + parseInt(stockQty)}
                    </strong>
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={stockLoading || !stockQty || stockQty === '0'}
                >
                  {stockLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleCloseStockModal}
                  disabled={stockLoading}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;

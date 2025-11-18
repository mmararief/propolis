import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';

const AdminBatchesPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productRes, batchRes] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/products/${productId}/batches`),
      ]);
      setProduct(productRes.data.data);
      setBatches(batchRes.data.data ?? batchRes.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data batch');
      console.error('Failed to fetch batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchBatches();
    }
  }, [productId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Batch</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Memuat data...' : product ? `Produk: ${product.nama_produk}` : 'Produk tidak ditemukan'}
          </p>
        </div>
        {product && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(`/admin/products/${productId}/batches/new`)}
          >
            + Tambah Batch
          </button>
        )}
      </div>

      {loading && !product ? (
        <div className="card">
          <p className="text-slate-500 text-center py-8">Memuat data produk...</p>
        </div>
      ) : error && !product ? (
        <div className="card">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              type="button"
              className="btn-primary mt-2"
              onClick={fetchBatches}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      ) : product ? (
        <>
          {/* Product Info */}
          <div className="card space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Produk ID: #{productId}</p>
                <h2 className="text-xl font-bold text-slate-900">{product.nama_produk}</h2>
                {product.sku && (
                  <p className="text-sm text-slate-600 mt-1">SKU: {product.sku}</p>
                )}
              </div>
              <button
                type="button"
                className="btn-outline"
                onClick={() => navigate('/admin/products')}
              >
                Kembali ke Produk
              </button>
            </div>
          </div>

          {/* Batches List */}
          <div className="card space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Daftar Batch</h3>
            {loading ? (
              <p className="text-slate-500 text-center py-8">Memuat daftar batch...</p>
            ) : batches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 mb-4">Belum ada batch untuk produk ini.</p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate(`/admin/products/${productId}/batches/new`)}
                >
                  Tambah Batch Pertama
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="py-3 font-semibold text-slate-900">Nomor Batch</th>
                      <th className="py-3 font-semibold text-slate-900">Stok Awal</th>
                      <th className="py-3 font-semibold text-slate-900">Stok Sisa</th>
                      <th className="py-3 font-semibold text-slate-900">Reserved</th>
                      <th className="py-3 font-semibold text-slate-900">Tanggal Kadaluarsa</th>
                      <th className="py-3 font-semibold text-slate-900">Harga Beli</th>
                      <th className="py-3 font-semibold text-slate-900">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr key={batch.id} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-3">
                          <span className="font-medium text-slate-900">{batch.batch_number}</span>
                        </td>
                        <td className="py-3 text-slate-600">{batch.qty_initial ?? '-'}</td>
                        <td className="py-3">
                          <span className={`font-semibold ${
                            batch.qty_remaining > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {batch.qty_remaining}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`font-semibold ${
                            batch.reserved_qty > 0 ? 'text-orange-600' : 'text-slate-400'
                          }`}>
                            {batch.reserved_qty}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">
                          {batch.expiry_date ? (
                            new Date(batch.expiry_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 text-slate-600">
                          {batch.purchase_price ? (
                            `Rp ${Number(batch.purchase_price).toLocaleString('id-ID')}`
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="btn-outline px-3 py-1 text-xs"
                              onClick={() => navigate(`/admin/products/${productId}/batches/${batch.id}/edit`)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-primary px-3 py-1 text-xs"
                              onClick={() => navigate(`/admin/products/${productId}/batches/${batch.id}/restock`)}
                            >
                              Tambah Stok
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
        </>
      ) : null}
    </div>
  );
};

export default AdminBatchesPage;

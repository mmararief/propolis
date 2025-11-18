import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';

const AdminBatchRestockPage = () => {
  const { productId, id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    qty_initial: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const [productRes, batchesRes] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get(`/products/${productId}/batches`),
      ]);
      setProduct(productRes.data.data);
      const batches = batchesRes.data.data ?? batchesRes.data ?? [];
      const foundBatch = batches.find((b) => b.id === parseInt(id));
      if (foundBatch) {
        setBatch(foundBatch);
      } else {
        setError('Batch tidak ditemukan');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data batch');
    } finally {
      setFetching(false);
    }
  }, [productId, id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      // Use the same endpoint as creating batch, but with existing batch_number
      const response = await api.post(`/products/${productId}/batches`, {
        batch_number: batch.batch_number,
        qty_initial: Number(form.qty_initial),
        expiry_date: batch.expiry_date || null,
        purchase_price: batch.purchase_price || null,
      });
      
      const responseMessage = response.data?.message || 'Stok berhasil ditambahkan';
      setMessage(responseMessage);

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate(`/admin/products/${productId}/batches`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menambahkan stok');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Stok Batch</h1>
          <p className="text-sm text-slate-500">Memuat data batch...</p>
        </div>
      </div>
    );
  }

  if (error && !batch) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Stok Batch</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-600">{error}</p>
            <button
              type="button"
              className="btn-primary mt-2"
              onClick={fetchData}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Stok Batch</h1>
          <p className="text-sm text-slate-500">
            {product && batch ? (
              <>
                Produk: <span className="font-semibold">{product.nama_produk}</span> | Batch: <span className="font-semibold">{batch.batch_number}</span>
              </>
            ) : (
              'Loading...'
            )}
          </p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate(`/admin/products/${productId}/batches`)}
        >
          Kembali
        </button>
      </div>

      {/* Batch Info */}
      {batch && (
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Informasi Batch</h2>
          <div className="grid md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-slate-500">Nomor Batch</p>
              <p className="font-semibold text-slate-900">{batch.batch_number}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Stok Awal</p>
              <p className="font-semibold text-slate-900">{batch.qty_initial}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Stok Sisa</p>
              <p className="font-semibold text-slate-900">{batch.qty_remaining}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Reserved</p>
              <p className="font-semibold text-slate-900">{batch.reserved_qty}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Tambah Stok</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Jumlah Stok yang Ditambahkan <span className="text-red-500">*</span>
            </label>
            <input
              className="input-field w-full"
              type="number"
              value={form.qty_initial}
              onChange={(e) => setForm({ ...form, qty_initial: e.target.value })}
              placeholder="0"
              min="1"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Stok saat ini: <span className="font-semibold">{batch?.qty_remaining || 0}</span> | 
              Setelah ditambah: <span className="font-semibold text-green-600">
                {batch ? (batch.qty_remaining + (Number(form.qty_initial) || 0)) : 0}
              </span>
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Menambahkan...' : 'Tambah Stok'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate(`/admin/products/${productId}/batches`)}
              disabled={loading}
            >
              Batal
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm">{message}</p>
              <p className="text-xs text-green-600 mt-1">Mengalihkan ke halaman batch...</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminBatchRestockPage;


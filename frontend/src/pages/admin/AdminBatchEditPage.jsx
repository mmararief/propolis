import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import BatchImageExtractor from '../../components/BatchImageExtractor';
import { normalizeExtractedDate } from '../../utils/extractHelpers';

const AdminBatchEditPage = () => {
  const { productId, id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    expiry_date: '',
    purchase_price: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [extractError, setExtractError] = useState(null);

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
        setForm({
          expiry_date: foundBatch.expiry_date
            ? new Date(foundBatch.expiry_date).toISOString().split('T')[0]
            : '',
          purchase_price: foundBatch.purchase_price?.toString() || '',
        });
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

  const handleExtract = (data) => {
    if (data) {
      if (data.exp) {
        const normalizedDate = normalizeExtractedDate(data.exp);
        if (normalizedDate) {
          setForm((prev) => ({ ...prev, expiry_date: normalizedDate }));
        }
      }
      setExtractError(null);
    } else {
      setForm((prev) => ({ ...prev, expiry_date: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await api.put(`/products/${productId}/batches/${id}`, {
        expiry_date: form.expiry_date || null,
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      });
      setMessage('Batch berhasil diperbarui');

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate(`/admin/products/${productId}/batches`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memperbarui batch');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Batch</h1>
          <p className="text-sm text-slate-500">Memuat data batch...</p>
        </div>
      </div>
    );
  }

  if (error && !batch) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Batch</h1>
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
          <h1 className="text-2xl font-bold text-slate-900">Edit Batch</h1>
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

      {/* Info Batch (Read-only) */}
      {batch && (
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Informasi Batch (Tidak Dapat Diubah)</h2>
          <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
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
          <p className="text-xs text-slate-500 italic">
            ⚠️ Nomor batch dan jumlah stok tidak dapat diubah karena sudah terhubung dengan data order.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Edit Informasi Batch</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tanggal Kadaluarsa
              </label>
              <input
                className="input-field w-full"
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              />
              <p className="text-xs text-slate-500 mt-1">Opsional: tanggal kadaluarsa batch</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Harga Beli (per item)
              </label>
              <input
                className="input-field w-full"
                type="number"
                value={form.purchase_price}
                onChange={(e) => setForm({ ...form, purchase_price: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-slate-500 mt-1">Harga beli per 1 item (bukan total)</p>
            </div>
          </div>

          {/* Image Extractor */}
          <div className="pt-4 border-t border-slate-200">
            <BatchImageExtractor
              onExtract={handleExtract}
              onError={(err) => setExtractError(err)}
            />
            {extractError && (
              <p className="text-xs text-red-500 mt-2">
                {extractError}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              💡 Upload gambar kemasan untuk auto-fill tanggal kadaluarsa
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Perbarui Batch'}
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

export default AdminBatchEditPage;


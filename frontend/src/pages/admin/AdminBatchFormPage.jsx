import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import BatchImageExtractor from '../../components/BatchImageExtractor';
import { normalizeExtractedDate } from '../../utils/extractHelpers';

const initialForm = {
  batch_number: '',
  qty_initial: '',
  expiry_date: '',
  purchase_price: '',
};

const AdminBatchFormPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [extractError, setExtractError] = useState(null);

  const fetchProduct = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await api.get(`/products/${productId}`);
      setProduct(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data produk');
    } finally {
      setFetching(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleExtract = (data) => {
    if (data) {
      if (data.batch) {
        setForm((prev) => ({ ...prev, batch_number: data.batch }));
      }
      if (data.exp) {
        const normalizedDate = normalizeExtractedDate(data.exp);
        if (normalizedDate) {
          setForm((prev) => ({ ...prev, expiry_date: normalizedDate }));
        }
      }
      setExtractError(null);
    } else {
      setForm((prev) => ({ ...prev, batch_number: '', expiry_date: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await api.post(`/products/${productId}/batches`, {
        ...form,
        qty_initial: Number(form.qty_initial),
        purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      });
      
      // Check if it's a restock or new batch based on response message
      const responseMessage = response.data?.message || 'Batch berhasil ditambahkan';
      setMessage(responseMessage);
      
      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate(`/admin/products/${productId}/batches`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menambahkan batch');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Batch</h1>
          <p className="text-sm text-slate-500">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Batch</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <p className="text-red-600">{error}</p>
            <button
              type="button"
              className="btn-primary mt-2"
              onClick={fetchProduct}
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
          <h1 className="text-2xl font-bold text-slate-900">Tambah Batch</h1>
          <p className="text-sm text-slate-500">
            Produk: <span className="font-semibold">{product?.nama_produk || 'Loading...'}</span>
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

      {/* Form */}
      <div className="card space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nomor Batch <span className="text-red-500">*</span>
              </label>
              <input
                className="input-field w-full"
                value={form.batch_number}
                onChange={(e) => setForm({ ...form, batch_number: e.target.value })}
                placeholder="Contoh: BATCH-001"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                💡 Jika batch dengan nomor ini sudah ada, stok akan ditambahkan ke batch yang sudah ada
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jumlah Stok <span className="text-red-500">*</span>
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
                Jumlah stok yang ditambahkan (jika batch sudah ada, stok akan ditambahkan ke batch tersebut)
              </p>
            </div>

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
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Tambah Batch'}
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

export default AdminBatchFormPage;


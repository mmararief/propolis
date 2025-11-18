import { useState } from 'react';
import api from '../api/client';

const UploadProofPage = () => {
  const [orderId, setOrderId] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !orderId) return;
    const formData = new FormData();
    formData.append('bukti', file);
    setLoading(true);
    setError(null);
    try {
      await api.post(`/orders/${orderId}/upload-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Bukti berhasil diunggah');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-4 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Bukti Pembayaran</h1>
        <p className="text-sm text-slate-500">Gunakan format jpg/png/pdf dengan ukuran maksimal 2MB.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="text-sm font-semibold text-slate-700">
          ID Pesanan
          <input
            className="input-field mt-1"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          File Bukti
          <input
            type="file"
            className="mt-1 text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            accept=".jpg,.jpeg,.png,.pdf"
            required
          />
        </label>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Mengunggah...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default UploadProofPage;


import { useState } from 'react';
import api from '../api/client';

const UploadProofPage = () => {
  const [orderId, setOrderId] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFileSizeError(null);
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validasi ukuran file (2 MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024; // 2 MB dalam bytes
    if (selectedFile.size > maxSize) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setFileSizeError(`Ukuran file terlalu besar (${fileSizeMB} MB). Maksimal ukuran file adalah 2 MB.`);
      setFile(null);
      // Reset input file
      e.target.value = '';
      return;
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileSizeError('Format file tidak didukung. Gunakan format JPG, PNG, atau PDF.');
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !orderId) return;
    
    // Validasi ulang sebelum upload
    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileSizeError(`Ukuran file terlalu besar (${fileSizeMB} MB). Maksimal ukuran file adalah 2 MB.`);
      return;
    }

    const formData = new FormData();
    formData.append('bukti', file);
    setLoading(true);
    setError(null);
    setMessage(null);
    setFileSizeError(null);
    try {
      await api.post(`/orders/${orderId}/upload-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Bukti berhasil diunggah');
      setFile(null);
      setOrderId('');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal mengunggah bukti pembayaran';
      setError(errorMessage);
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
            onChange={handleFileChange}
            accept="image/jpeg,image/jpg,image/png,.pdf,application/pdf"
            required
          />
          {file && (
            <p className="mt-2 text-xs text-slate-600">
              File dipilih: <span className="font-semibold">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </label>
        {fileSizeError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm flex items-start gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{fileSizeError}</span>
            </p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading || !file || !!fileSizeError}>
          {loading ? 'Mengunggah...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default UploadProofPage;


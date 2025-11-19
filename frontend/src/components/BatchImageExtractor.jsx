import { useState } from 'react';
import api from '../api/client';

const BatchImageExtractor = ({ onExtract, onError }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError?.('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError?.('Ukuran file maksimal 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Extract data
    await extractBatchData(file);
  };

  const extractBatchData = async (file) => {
    setUploading(true);
    setExtractedData(null);
    onError?.(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/extract-batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data?.data || response.data;
      
      // Validate response format
      if (data && (data.batch || data.exp)) {
        setExtractedData(data);
        onExtract?.(data);
      } else {
        throw new Error('Format respons tidak valid');
      }
    } catch (error) {
      console.error('Error extracting batch data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal mengekstrak data dari gambar';
      onError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setExtractedData(null);
    onExtract?.(null);
    onError?.(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Extract dari Gambar (Opsional)
      </label>
      
      {!preview ? (
        <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
          uploading 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-slate-300 hover:border-blue-400'
        }`}>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="batch-image-upload"
            disabled={uploading}
          />
          <label
            htmlFor="batch-image-upload"
            className={`cursor-pointer flex flex-col items-center ${uploading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {uploading ? (
              <div className="py-4">
                <div className="relative flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Sedang mengekstrak data dari gambar...
                </p>
                <p className="text-xs text-blue-700">
                  Mohon tunggu, AI sedang memproses gambar Anda
                </p>
                <div className="mt-3 flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <>
                <svg
                  className="w-12 h-12 text-slate-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm text-slate-600">
                  Klik untuk upload gambar kemasan produk
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  AI akan mengekstrak nomor batch dan tanggal kadaluarsa
                </p>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative mx-auto max-w-xl">
            <img
              src={preview}
              alt="Preview"
              className={`w-full max-h-56 object-contain rounded-lg border border-slate-200 bg-white shadow-sm transition-opacity ${
                uploading ? 'opacity-50' : ''
              }`}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center mb-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-blue-600 animate-pulse"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mb-1">
                      Mengekstrak data...
                    </p>
                    <p className="text-xs text-slate-600">
                      Memproses gambar dengan AI
                    </p>
                  </div>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={clearImage}
              disabled={uploading}
              className={`absolute top-2 right-2 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-all ${
                uploading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              ×
            </button>
          </div>

          {uploading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600"></div>
                <p className="text-sm text-blue-900">
                  Sedang mengekstrak nomor batch dan tanggal kadaluarsa dari gambar...
                </p>
              </div>
            </div>
          )}

          {extractedData && !uploading && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-green-900 mb-2">
                ✓ Data berhasil diekstrak:
              </p>
              <div className="space-y-1 text-sm">
                {extractedData.batch && (
                  <p className="text-green-800">
                    <span className="font-medium">Batch:</span> {extractedData.batch}
                  </p>
                )}
                {extractedData.exp && (
                  <p className="text-green-800">
                    <span className="font-medium">EXP:</span> {extractedData.exp}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchImageExtractor;


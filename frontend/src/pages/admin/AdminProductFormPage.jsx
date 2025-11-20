import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { getProductImageUrl } from '../../utils/imageHelper';

const initialForm = {
  kategori_id: '',
  sku: '',
  nama_produk: '',
  harga_ecer: '',
  stok: '0',
  status: 'aktif',
  deskripsi: '',
  berat: '500',
  gambar_file: null,
};

const AdminProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data?.data ?? data.data ?? []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    setFetching(true);
    try {
      const { data } = await api.get(`/products/${id}`);
      const product = data.data;
      setForm({
        kategori_id: product.kategori_id || '',
        sku: product.sku || '',
        nama_produk: product.nama_produk || '',
        harga_ecer: product.harga_ecer || '',
        stok: product.stok?.toString() || '0',
        status: product.status || 'aktif',
        deskripsi: product.deskripsi || '',
        berat: product.berat?.toString() || '500',
      });
      const productImages = Array.isArray(product.gambar) 
        ? product.gambar 
        : (product.gambar ? [product.gambar] : []);
      setExistingImages(productImages.map(img => getProductImageUrl(img)));
      setImageFiles([]);
      setImagesToDelete([]);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat produk');
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [fetchCategories, fetchProduct, isEdit]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
    }
    // Reset input
    e.target.value = '';
  };

  const removeImageFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    setImagesToDelete((prev) => [...prev, imageUrl]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('kategori_id', form.kategori_id);
      formData.append('sku', form.sku);
      formData.append('nama_produk', form.nama_produk);
      formData.append('harga_ecer', form.harga_ecer);
      formData.append('stok', form.stok || '0');
      formData.append('status', form.status);
      if (form.deskripsi) {
        formData.append('deskripsi', form.deskripsi);
      }
      if (form.berat) {
        formData.append('berat', form.berat);
      }
      
      // Append existing images (those not marked for deletion)
      if (existingImages.length > 0) {
        existingImages.forEach((img) => {
          if (!imagesToDelete.includes(img)) {
            formData.append('gambar[]', img);
          }
        });
      }
      
      // Append new image files
      imageFiles.forEach((file) => {
        formData.append('gambar_file[]', file);
      });
      
      // Append images to delete
      imagesToDelete.forEach((img) => {
        formData.append('gambar_hapus[]', img);
      });

      if (isEdit) {
        await api.put(`/products/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Produk berhasil diperbarui');
      } else {
        await api.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Produk berhasil ditambahkan');
      }

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h1>
          <p className="text-sm text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h1>
          <p className="text-sm text-slate-500">
            {isEdit ? 'Perbarui informasi produk' : 'Isi form di bawah untuk menambahkan produk baru'}
          </p>
        </div>
        <button
          type="button"
          className="btn-outline"
          onClick={() => navigate('/admin/products')}
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
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                className="input-field w-full"
                value={form.kategori_id}
                onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                className="input-field w-full"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Contoh: PROD-001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                className="input-field w-full"
                value={form.nama_produk}
                onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
                placeholder="Nama produk"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Harga Ecer (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                className="input-field w-full"
                type="number"
                value={form.harga_ecer}
                onChange={(e) => setForm({ ...form, harga_ecer: e.target.value })}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                className="input-field w-full"
                type="number"
                value={form.stok}
                onChange={(e) => setForm({ ...form, stok: e.target.value })}
                placeholder="0"
                min="0"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Jumlah stok awal produk</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="input-field w-full"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Berat (gram) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="input-field w-full"
                value={form.berat}
                onChange={(e) => setForm({ ...form, berat: e.target.value })}
                min="1"
                placeholder="500"
                required
              />
              <p className="text-xs text-slate-500 mt-1">Berat produk dalam gram (default: 500g)</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deskripsi
              </label>
              <textarea
                className="input-field w-full"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={4}
                placeholder="Deskripsi produk..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gambar Produk (Bisa upload lebih dari 1 gambar)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="input-field w-full"
                onChange={handleImageChange}
                multiple
              />
              <p className="text-xs text-slate-500 mt-1">
                Pilih satu atau lebih gambar. Format: JPG, PNG, atau WebP (max 2MB per gambar)
              </p>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Gambar Saat Ini:</p>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={img}
                          alt={`Gambar ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New Image Previews */}
              {imageFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Gambar Baru:</p>
                  <div className="flex flex-wrap gap-3">
                    {imageFiles.map((file, idx) => {
                      const preview = URL.createObjectURL(file);
                      return (
                        <div key={idx} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageFile(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : isEdit ? 'Perbarui Produk' : 'Tambah Produk'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/admin/products')}
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
              <p className="text-xs text-green-600 mt-1">Mengalihkan ke halaman produk...</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminProductFormPage;


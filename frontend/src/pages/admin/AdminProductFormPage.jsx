import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { getProductImageUrl } from '../../utils/imageHelper';

const initialForm = {
  kategori_id: '',
  sku: '',
  nama_produk: '',
  harga_ecer: '',
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
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

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
        status: product.status || 'aktif',
        deskripsi: product.deskripsi || '',
        berat: product.berat?.toString() || '500',
        gambar_file: null,
      });
      setExistingImage(product.gambar ? getProductImageUrl(product.gambar) : null);
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
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, gambar_file: file });
      setExistingImage(null);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      formData.append('status', form.status);
      if (form.deskripsi) {
        formData.append('deskripsi', form.deskripsi);
      }
      if (form.berat) {
        formData.append('berat', form.berat);
      }
      if (form.gambar_file) {
        formData.append('gambar_file', form.gambar_file);
      }

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
                Gambar Produk
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="input-field w-full"
                onChange={handleImageChange}
              />
              {(imagePreview || existingImage) && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 mb-2">Preview:</p>
                  <img
                    src={imagePreview || existingImage}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                  />
                  {existingImage && !imagePreview && (
                    <p className="text-xs text-slate-500 mt-1">Gambar saat ini</p>
                  )}
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


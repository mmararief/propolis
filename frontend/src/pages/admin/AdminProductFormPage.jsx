import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [priceTiers, setPriceTiers] = useState([]);
  const [tierFetching, setTierFetching] = useState(false);
  const [tierActionLoading, setTierActionLoading] = useState(false);
  const [tierError, setTierError] = useState(null);
  const tierInitialForm = useMemo(
    () => ({
      min_jumlah: '',
      max_jumlah: '',
      harga_total: '',
      label: '',
    }),
    [],
  );
  const [tierForm, setTierForm] = useState(tierInitialForm);
  const [editingTierId, setEditingTierId] = useState(null);
  const [editTierValues, setEditTierValues] = useState(tierInitialForm);

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
      setPriceTiers(product.price_tiers ?? product.priceTiers ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat produk');
    } finally {
      setFetching(false);
    }
  }, [id]);

  const fetchPriceTiers = useCallback(async () => {
    if (!isEdit) return;
    setTierFetching(true);
    setTierError(null);
    try {
      const { data } = await api.get(`/admin/products/${id}/price-tiers`);
      setPriceTiers(data.data ?? data ?? []);
    } catch (err) {
      setTierError(err.response?.data?.message || err.message || 'Gagal memuat harga tingkat');
    } finally {
      setTierFetching(false);
    }
  }, [id, isEdit]);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [fetchCategories, fetchProduct, isEdit]);

  useEffect(() => {
    if (isEdit) {
      fetchPriceTiers();
    }
  }, [fetchPriceTiers, isEdit]);

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

  const resetTierForms = () => {
    setTierForm(tierInitialForm);
    setEditingTierId(null);
    setEditTierValues(tierInitialForm);
  };

  const handleAddTier = async (e) => {
    e.preventDefault();
    if (!isEdit) return;
    setTierError(null);
    setTierActionLoading(true);
    try {
      await api.post(`/admin/products/${id}/price-tiers`, {
        min_jumlah: Number(tierForm.min_jumlah),
        max_jumlah: tierForm.max_jumlah ? Number(tierForm.max_jumlah) : null,
        harga_total: Number(tierForm.harga_total),
        label: tierForm.label || null,
      });
      resetTierForms();
      fetchPriceTiers();
    } catch (err) {
      setTierError(err.response?.data?.message || err.message || 'Gagal menambah harga tingkat');
    } finally {
      setTierActionLoading(false);
    }
  };

  const startEditTier = (tier) => {
    setEditingTierId(tier.id);
    setEditTierValues({
      min_jumlah: tier.min_jumlah?.toString() ?? '',
      max_jumlah: tier.max_jumlah?.toString() ?? '',
      harga_total: tier.harga_total?.toString() ?? '',
      label: tier.label ?? '',
    });
  };

  const cancelEditTier = () => {
    setEditingTierId(null);
    setEditTierValues(tierInitialForm);
  };

  const handleUpdateTier = async (tierId) => {
    setTierError(null);
    setTierActionLoading(true);
    try {
      await api.put(`/admin/products/${id}/price-tiers/${tierId}`, {
        min_jumlah: Number(editTierValues.min_jumlah),
        max_jumlah: editTierValues.max_jumlah ? Number(editTierValues.max_jumlah) : null,
        harga_total: Number(editTierValues.harga_total),
        label: editTierValues.label || null,
      });
      cancelEditTier();
      fetchPriceTiers();
    } catch (err) {
      setTierError(err.response?.data?.message || err.message || 'Gagal memperbarui harga tingkat');
    } finally {
      setTierActionLoading(false);
    }
  };

  const handleDeleteTier = async (tierId) => {
    if (!window.confirm('Hapus harga tingkat ini?')) return;
    setTierError(null);
    setTierActionLoading(true);
    try {
      await api.delete(`/admin/products/${id}/price-tiers/${tierId}`);
      if (editingTierId === tierId) {
        cancelEditTier();
      }
      fetchPriceTiers();
    } catch (err) {
      setTierError(err.response?.data?.message || err.message || 'Gagal menghapus harga tingkat');
    } finally {
      setTierActionLoading(false);
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

      {isEdit && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Harga Tingkat</h2>
              <p className="text-sm text-slate-500">
                Atur diskon berdasarkan jumlah pembelian. Harga ini akan dipakai otomatis saat checkout.
              </p>
            </div>
            <button type="button" className="btn-outline text-sm" onClick={fetchPriceTiers} disabled={tierFetching}>
              {tierFetching ? 'Memuat...' : 'Refresh'}
            </button>
          </div>

          {tierError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{tierError}</div>
          )}

            <div className="overflow-x-auto">
              {tierFetching ? (
                <p className="text-sm text-slate-500">Memuat harga tingkat...</p>
              ) : priceTiers.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada harga tingkat untuk produk ini.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b">
                      <th className="py-2">Rentang Qty</th>
                      <th className="py-2">Label</th>
                      <th className="py-2">Harga Total</th>
                      <th className="py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceTiers.map((tier) => (
                      <tr key={tier.id} className="border-b">
                        <td className="py-3">
                          {editingTierId === tier.id ? (
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="1"
                                className="input-field w-24"
                                value={editTierValues.min_jumlah}
                                onChange={(e) => setEditTierValues({ ...editTierValues, min_jumlah: e.target.value })}
                              />
                              <span className="text-sm text-slate-500">sampai</span>
                              <input
                                type="number"
                                min={editTierValues.min_jumlah || 1}
                                className="input-field w-24"
                                value={editTierValues.max_jumlah}
                                onChange={(e) => setEditTierValues({ ...editTierValues, max_jumlah: e.target.value })}
                              />
                            </div>
                          ) : (
                            <span className="font-medium text-slate-900">
                              {tier.min_jumlah}+{tier.max_jumlah ? ` - ${tier.max_jumlah}` : ''}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          {editingTierId === tier.id ? (
                            <input
                              className="input-field w-full"
                              value={editTierValues.label}
                              onChange={(e) => setEditTierValues({ ...editTierValues, label: e.target.value })}
                              placeholder="Label (opsional)"
                            />
                          ) : (
                            <span className="text-slate-700">{tier.label || '-'}</span>
                          )}
                        </td>
                        <td className="py-3">
                          {editingTierId === tier.id ? (
                            <input
                              type="number"
                              min="0"
                              className="input-field w-full"
                              value={editTierValues.harga_total}
                              onChange={(e) => setEditTierValues({ ...editTierValues, harga_total: e.target.value })}
                            />
                          ) : (
                            <span className="font-semibold text-slate-900">
                              Rp {Number(tier.harga_total).toLocaleString('id-ID')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {editingTierId === tier.id ? (
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                className="btn-primary px-3 py-1 text-xs"
                                onClick={() => handleUpdateTier(tier.id)}
                                disabled={tierActionLoading}
                              >
                                Simpan
                              </button>
                              <button
                                type="button"
                                className="btn-outline px-3 py-1 text-xs"
                                onClick={cancelEditTier}
                                disabled={tierActionLoading}
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                className="btn-outline px-3 py-1 text-xs"
                                onClick={() => startEditTier(tier)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-outline px-3 py-1 text-xs text-red-600 border-red-200 hover:text-red-700"
                                onClick={() => handleDeleteTier(tier.id)}
                                disabled={tierActionLoading}
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          <form className="border border-dashed border-slate-300 rounded-lg p-4 space-y-4" onSubmit={handleAddTier}>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Min Qty</label>
                <input
                  type="number"
                  min="1"
                  className="input-field w-full"
                  value={tierForm.min_jumlah}
                  onChange={(e) => setTierForm({ ...tierForm, min_jumlah: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Qty</label>
                <input
                  type="number"
                  min={tierForm.min_jumlah || 1}
                  className="input-field w-full"
                  value={tierForm.max_jumlah}
                  onChange={(e) => setTierForm({ ...tierForm, max_jumlah: e.target.value })}
                  placeholder="Opsional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Harga Total (Rp)</label>
                <input
                  type="number"
                  min="0"
                  className="input-field w-full"
                  value={tierForm.harga_total}
                  onChange={(e) => setTierForm({ ...tierForm, harga_total: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                <input
                  className="input-field w-full"
                  value={tierForm.label}
                  onChange={(e) => setTierForm({ ...tierForm, label: e.target.value })}
                  placeholder="Contoh: Reseller"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={tierActionLoading || !tierForm.min_jumlah || !tierForm.harga_total}
              >
                {tierActionLoading ? 'Menyimpan...' : 'Tambah Harga Tingkat'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminProductFormPage;


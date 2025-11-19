import { useEffect, useState } from 'react';
import api from '../../api/client';

const AdminPriceTiersPage = () => {
  const [tiers, setTiers] = useState([]);
  const [form, setForm] = useState({
    min_jumlah: '',
    max_jumlah: '',
    harga_total: '',
    label: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    try {
      const { data } = await api.get('/admin/price-tiers');
      setTiers(data.data ?? data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat harga tingkat');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        min_jumlah: parseInt(form.min_jumlah),
        max_jumlah: form.max_jumlah ? parseInt(form.max_jumlah) : null,
        harga_total: parseFloat(form.harga_total),
        label: form.label || null,
      };

      if (editingId) {
        await api.put(`/admin/price-tiers/${editingId}`, payload);
        setMessage('Harga tingkat berhasil diperbarui');
      } else {
        await api.post('/admin/price-tiers', payload);
        setMessage('Harga tingkat berhasil ditambahkan');
      }
      setForm({
        min_jumlah: '',
        max_jumlah: '',
        harga_total: '',
        label: '',
      });
      setEditingId(null);
      fetchTiers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan harga tingkat');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tier) => {
    setForm({
      min_jumlah: tier.min_jumlah.toString(),
      max_jumlah: tier.max_jumlah ? tier.max_jumlah.toString() : '',
      harga_total: tier.harga_total.toString(),
      label: tier.label || '',
    });
    setEditingId(tier.id);
    setError(null);
    setMessage(null);
  };

  const handleCancel = () => {
    setForm({
      min_jumlah: '',
      max_jumlah: '',
      harga_total: '',
      label: '',
    });
    setEditingId(null);
    setError(null);
    setMessage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus harga tingkat ini?')) {
      return;
    }

    try {
      await api.delete(`/admin/price-tiers/${id}`);
      setMessage('Harga tingkat berhasil dihapus');
      fetchTiers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menghapus harga tingkat');
    }
  };

  const formatCurrency = (value) => {
    return `Rp ${Number(value).toLocaleString('id-ID')}`;
  };

  const formatRange = (min, max) => {
    if (!max) {
      return `${min}+`;
    }
    if (min === max) {
      return `${min}`;
    }
    return `${min} - ${max}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kelola Harga Tingkat</h1>
        <p className="text-sm text-slate-500">
          Kelola harga tingkat global yang berlaku untuk semua produk berdasarkan jumlah pembelian.
        </p>
      </div>

      {/* Form */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? 'Edit Harga Tingkat' : 'Tambah Harga Tingkat Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="min_jumlah" className="block text-sm font-medium text-slate-700 mb-1">
                Minimum Jumlah <span className="text-red-500">*</span>
              </label>
              <input
                id="min_jumlah"
                type="number"
                min="1"
                className="input-field"
                value={form.min_jumlah}
                onChange={(e) => setForm({ ...form, min_jumlah: e.target.value })}
                placeholder="Contoh: 10"
                required
              />
            </div>
            <div>
              <label htmlFor="max_jumlah" className="block text-sm font-medium text-slate-700 mb-1">
                Maksimum Jumlah (opsional)
              </label>
              <input
                id="max_jumlah"
                type="number"
                min="1"
                className="input-field"
                value={form.max_jumlah}
                onChange={(e) => setForm({ ...form, max_jumlah: e.target.value })}
                placeholder="Kosongkan untuk tidak terbatas"
              />
              <p className="text-xs text-slate-500 mt-1">
                Kosongkan untuk harga tingkat tanpa batas atas
              </p>
            </div>
          </div>
          <div>
            <label htmlFor="harga_total" className="block text-sm font-medium text-slate-700 mb-1">
              Harga Total untuk {form.min_jumlah || 'min_jumlah'} item <span className="text-red-500">*</span>
            </label>
            <input
              id="harga_total"
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              value={form.harga_total}
              onChange={(e) => setForm({ ...form, harga_total: e.target.value })}
              placeholder="Contoh: 250000 (untuk 1 item), 650000 (untuk 3 item)"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Harga total untuk jumlah minimum. Contoh: Beli 1 item = 250.000, Beli 3 item = 650.000
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Harga per item akan dihitung otomatis: Harga Total ÷ Minimum Jumlah
            </p>
          </div>
          <div>
            <label htmlFor="label" className="block text-sm font-medium text-slate-700 mb-1">
              Label (opsional)
            </label>
            <input
              id="label"
              type="text"
              maxLength="50"
              className="input-field"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Contoh: Grosir, Ecer, dll"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Tambah'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Batal
              </button>
            )}
          </div>
        </form>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
      </div>

      {/* Tiers List */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Daftar Harga Tingkat</h2>
        {tiers.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Belum ada harga tingkat</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="py-2 font-semibold text-slate-900">ID</th>
                  <th className="py-2 font-semibold text-slate-900">Rentang Jumlah</th>
                  <th className="py-2 font-semibold text-slate-900">Harga Total</th>
                  <th className="py-2 font-semibold text-slate-900">Label</th>
                  <th className="py-2 font-semibold text-slate-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.id} className="border-b border-slate-50">
                    <td className="py-3 text-slate-600">#{tier.id}</td>
                    <td className="py-3 font-medium text-slate-900">
                      {formatRange(tier.min_jumlah, tier.max_jumlah)} item
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-900">
                        {formatCurrency(tier.harga_total)}
                      </div>
                      <div className="text-xs text-slate-500">
                        (Rp {formatCurrency(tier.harga_total / tier.min_jumlah)} / item)
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">
                      {tier.label || '-'}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn-outline px-3 py-1 text-xs"
                          onClick={() => handleEdit(tier)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-primary px-3 py-1 text-xs bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(tier.id)}
                        >
                          Hapus
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
    </div>
  );
};

export default AdminPriceTiersPage;


import { useEffect, useState } from 'react';
import api from '../../api/client';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    username: '',
    email: '',
    password: '',
    no_hp: '',
    role: 'user',
    provinsi: '',
    kabupaten_kota: '',
    kecamatan: '',
    kelurahan: '',
    kode_pos: '',
    alamat_lengkap: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data?.data ?? data.data ?? []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setIsEditing(true);
      setEditingId(user.id);
      setFormData({
        nama_lengkap: user.nama_lengkap || '',
        username: user.username || '',
        email: user.email || '',
        password: '',
        no_hp: user.no_hp || '',
        role: user.role || 'user',
        provinsi: user.provinsi || '',
        kabupaten_kota: user.kabupaten_kota || '',
        kecamatan: user.kecamatan || '',
        kelurahan: user.kelurahan || '',
        kode_pos: user.kode_pos || '',
        alamat_lengkap: user.alamat_lengkap || '',
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        nama_lengkap: '',
        username: '',
        email: '',
        password: '',
        no_hp: '',
        role: 'user',
        provinsi: '',
        kabupaten_kota: '',
        kecamatan: '',
        kelurahan: '',
        kode_pos: '',
        alamat_lengkap: '',
      });
    }
    setFormError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const submitData = { ...formData };
      
      // Jika edit dan password kosong, jangan kirim password
      if (isEditing && !submitData.password) {
        delete submitData.password;
      }

      if (isEditing) {
        await api.put(`/admin/users/${editingId}`, submitData);
      } else {
        await api.post('/admin/users', submitData);
      }

      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setFormError(
        err.response?.data?.message || err.message || 'Gagal menyimpan data user'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Gagal menghapus user');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Akun Users</h1>
          <p className="text-sm text-slate-500">Kelola semua akun pengguna di sistem.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => handleOpenModal()}
        >
          + Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <input
          type="text"
          placeholder="Cari berdasarkan nama, email, atau username..."
          className="input-field w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Users List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              type="button"
              className="btn-primary mt-2"
              onClick={fetchUsers}
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">
              {searchQuery ? 'Tidak ada user yang cocok dengan pencarian' : 'Belum ada user'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleOpenModal()}
              >
                Tambah User Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-3 px-4 font-semibold text-slate-900">Nama</th>
                  <th className="py-3 px-4 font-semibold text-slate-900">Email</th>
                  <th className="py-3 px-4 font-semibold text-slate-900">Username</th>
                  <th className="py-3 px-4 font-semibold text-slate-900">No HP</th>
                  <th className="py-3 px-4 font-semibold text-slate-900">Role</th>
                  <th className="py-3 px-4 font-semibold text-slate-900">Alamat</th>
                  <th className="py-3 px-4 font-semibold text-slate-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{user.nama_lengkap}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{user.email}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                      {user.username}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{user.no_hp || '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`badge-status text-xs px-2 py-1 rounded ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {user.alamat_lengkap ? (
                        <div className="line-clamp-2">{user.alamat_lengkap}</div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn-outline px-3 py-1 text-xs"
                          onClick={() => handleOpenModal(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-primary px-3 py-1 text-xs bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(user.id)}
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

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {isEditing ? 'Edit User' : 'Tambah User Baru'}
            </h2>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-600 text-sm">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    className="input-field w-full"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="input-field w-full"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input-field w-full"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password {!isEditing && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="input-field w-full"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditing}
                    placeholder={isEditing ? 'Kosongkan jika tidak ingin mengubah' : ''}
                  />
                </div>

                {/* No HP */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    No HP
                  </label>
                  <input
                    type="text"
                    name="no_hp"
                    className="input-field w-full"
                    value={formData.no_hp}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    className="input-field w-full"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Provinsi */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    name="provinsi"
                    className="input-field w-full"
                    value={formData.provinsi}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Kabupaten/Kota */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kabupaten/Kota
                  </label>
                  <input
                    type="text"
                    name="kabupaten_kota"
                    className="input-field w-full"
                    value={formData.kabupaten_kota}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Kecamatan */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    name="kecamatan"
                    className="input-field w-full"
                    value={formData.kecamatan}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Kelurahan */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kelurahan
                  </label>
                  <input
                    type="text"
                    name="kelurahan"
                    className="input-field w-full"
                    value={formData.kelurahan}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Kode Pos */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    name="kode_pos"
                    className="input-field w-full"
                    value={formData.kode_pos}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Alamat Lengkap */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Alamat Lengkap
                  </label>
                  <textarea
                    name="alamat_lengkap"
                    className="input-field w-full"
                    rows="3"
                    value={formData.alamat_lengkap}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={formLoading}
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleCloseModal}
                  disabled={formLoading}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

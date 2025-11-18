import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProfileSidebar from '../components/ProfileSidebar';

const ProfilePage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    username: '',
    nama_lengkap: '',
    email: '',
    no_hp: '',
    province_id: '',
    city_id: '',
    district_id: '',
    subdistrict_id: '',
    postal_code: '',
    alamat_lengkap: '',
  });
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const hasLoadedUserData = useRef(false);
  const previousProvinceId = useRef(null);
  const previousCityId = useRef(null);
  const previousDistrictId = useRef(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/profile');
      const userData = data.data;
      if (userData && !hasLoadedUserData.current) {
        // Get address data from addresses[0] if available, otherwise from user directly
        const defaultAddress = userData.addresses?.[0];
        const userForm = {
          username: userData.username || '',
          nama_lengkap: userData.nama_lengkap || '',
          email: userData.email || '',
          no_hp: defaultAddress?.phone || userData.no_hp || '',
          province_id: defaultAddress?.provinsi_id || userData.province_id || '',
          city_id: defaultAddress?.city_id || userData.city_id || '',
          district_id: defaultAddress?.district_id || userData.district_id || '',
          subdistrict_id: defaultAddress?.subdistrict_id || userData.subdistrict_id || '',
          postal_code: defaultAddress?.postal_code || userData.kode_pos || userData.postal_code || '',
          alamat_lengkap: defaultAddress?.address || userData.alamat_lengkap || '',
        };
        setForm(userForm);

        // Store previous values
        previousProvinceId.current = userForm.province_id;
        previousCityId.current = userForm.city_id;
        previousDistrictId.current = userForm.district_id;

        // Load dropdown options based on user's saved address
        const loadAddressData = async () => {
          if (userForm.province_id) {
            await fetchCities(userForm.province_id);
            if (userForm.city_id) {
              await fetchDistricts(userForm.city_id);
              if (userForm.district_id) {
                await fetchSubdistricts(userForm.district_id);
              }
            }
          }
        };
        loadAddressData();
        hasLoadedUserData.current = true;
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // Fallback to user from context
      if (user && !hasLoadedUserData.current) {
        const defaultAddress = user.addresses?.[0];
        const userForm = {
          username: user.username || '',
          nama_lengkap: user.nama_lengkap || '',
          email: user.email || '',
          no_hp: defaultAddress?.phone || user.no_hp || '',
          province_id: defaultAddress?.provinsi_id || user.province_id || '',
          city_id: defaultAddress?.city_id || user.city_id || '',
          district_id: defaultAddress?.district_id || user.district_id || '',
          subdistrict_id: defaultAddress?.subdistrict_id || user.subdistrict_id || '',
          postal_code: defaultAddress?.postal_code || user.kode_pos || user.postal_code || '',
          alamat_lengkap: defaultAddress?.address || user.alamat_lengkap || '',
        };
        setForm(userForm);
        hasLoadedUserData.current = true;
      }
    }
  }, [user]);

  useEffect(() => {
    fetchProvinces();
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (user && !hasLoadedUserData.current) {
      // This will be handled by fetchUserProfile
    }
  }, [user]);

  useEffect(() => {
    if (hasLoadedUserData.current && form.province_id !== previousProvinceId.current) {
      // User changed province
      if (form.province_id) {
        fetchCities(form.province_id);
      } else {
        setCities([]);
        setDistricts([]);
        setSubdistricts([]);
      }
      previousProvinceId.current = form.province_id;
    }
  }, [form.province_id]);

  useEffect(() => {
    if (hasLoadedUserData.current && form.city_id !== previousCityId.current) {
      // User changed city
      if (form.city_id) {
        fetchDistricts(form.city_id);
      } else {
        setDistricts([]);
        setSubdistricts([]);
      }
      previousCityId.current = form.city_id;
    }
  }, [form.city_id]);

  useEffect(() => {
    if (hasLoadedUserData.current && form.district_id !== previousDistrictId.current) {
      // User changed district
      if (form.district_id) {
        fetchSubdistricts(form.district_id);
      } else {
        setSubdistricts([]);
      }
      previousDistrictId.current = form.district_id;
    }
  }, [form.district_id]);

  const fetchProvinces = async () => {
    try {
      const { data } = await api.get('/shipping/provinces');
      setProvinces(data.data?.data ?? data.data ?? []);
    } catch (err) {
      console.error('Failed to fetch provinces:', err);
    }
  };

  const fetchCities = async (provinceId) => {
    try {
      const { data } = await api.get(`/shipping/cities/${provinceId}`);
      setCities(data.data?.data ?? data.data ?? []);
      return data.data?.data ?? data.data ?? [];
    } catch (err) {
      console.error('Failed to fetch cities:', err);
      setCities([]);
      return [];
    }
  };

  const fetchDistricts = async (cityId) => {
    try {
      const { data } = await api.get(`/shipping/districts/${cityId}`);
      setDistricts(data.data?.data ?? data.data ?? []);
      return data.data?.data ?? data.data ?? [];
    } catch (err) {
      console.error('Failed to fetch districts:', err);
      setDistricts([]);
      return [];
    }
  };

  const fetchSubdistricts = async (districtId) => {
    try {
      const { data } = await api.get(`/shipping/subdistricts/${districtId}`);
      setSubdistricts(data.data?.data ?? data.data ?? []);
      return data.data?.data ?? data.data ?? [];
    } catch (err) {
      console.error('Failed to fetch subdistricts:', err);
      setSubdistricts([]);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        username: form.username,
        nama_lengkap: form.nama_lengkap,
        email: form.email,
        no_hp: form.no_hp,
        province_id: form.province_id ? Number(form.province_id) : undefined,
        city_id: form.city_id ? Number(form.city_id) : undefined,
        district_id: form.district_id ? Number(form.district_id) : undefined,
        subdistrict_id: form.subdistrict_id ? Number(form.subdistrict_id) : undefined,
        postal_code: form.postal_code,
        alamat_lengkap: form.alamat_lengkap,
      };

      const { data } = await api.put('/auth/profile', payload);
      setMessage('Profil berhasil diperbarui!');
      
      // Update user in context if needed
      if (data.data?.user) {
        window.location.reload(); // Simple way to refresh user data
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative bg-white min-h-screen overflow-x-hidden pt-[100px] pb-20">
      <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px] pt-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8">
          <Link
            to="/"
            className="font-ui font-normal text-[16px] text-black hover:opacity-70 transition-colors"
          >
            Beranda
          </Link>
          <span className="font-ui font-normal text-[16px] text-black"> &gt; </span>
          <span className="font-ui font-normal text-[16px] text-black">User</span>
          <span className="font-ui font-normal text-[16px] text-black"> &gt; </span>
          <span
            className="font-ui font-normal text-[16px]"
            style={{ color: '#D2001A' }}
          >
            Akun
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-ui font-bold text-[48px] mb-8 uppercase text-center"
          style={{ color: '#D2001A' }}
        >
          AKUN SAYA
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - User Profile */}
          <ProfileSidebar activeTab="profile" />

          {/* Right Content Area - Profile Form */}
          <div className="grow">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-8">
              {/* Informasi Pribadi */}
              <div>
                <h2 className="text-xl font-ui font-semibold mb-2 text-gray-900">
                  Informasi Pribadi
                </h2>
                <p className="text-sm font-ui text-gray-600 mb-6">
                  Kelola informasi pribadi Anda untuk mengontrol, melindungi dan mengamankan akun
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-sm font-ui font-semibold text-gray-700">
                    Username
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                      required
                    />
                  </label>
                  <label className="text-sm font-ui font-semibold text-gray-700">
                    Nama Lengkap
                    <input
                      type="text"
                      value={form.nama_lengkap}
                      onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                      required
                    />
                  </label>
                  <label className="text-sm font-ui font-semibold text-gray-700">
                    Email
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                      required
                    />
                  </label>
                  <label className="text-sm font-ui font-semibold text-gray-700">
                    No. Telp
                    <input
                      type="tel"
                      value={form.no_hp}
                      onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                    />
                  </label>
                </div>
              </div>

              {/* Alamat */}
              <div>
                <h2 className="text-xl font-ui font-semibold mb-4 text-gray-900">Alamat</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-sm font-ui font-semibold text-gray-700">
                    Provinsi
                    <select
                      value={form.province_id}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          province_id: e.target.value,
                          city_id: '',
                          district_id: '',
                          subdistrict_id: '',
                        });
                      }}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                    >
                      <option value="">Pilih provinsi</option>
                      {provinces.map((province) => {
                        const value = province.province_id ?? province.id ?? province.provinceId;
                        const label = province.province ?? province.name ?? province.province_name;
                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="text-sm font-ui font-semibold text-gray-700">
                    Kota/Kabupaten
                    <select
                      value={form.city_id}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          city_id: e.target.value,
                          district_id: '',
                          subdistrict_id: '',
                        });
                      }}
                      disabled={!cities.length}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                    >
                      <option value="">Pilih kota/kabupaten</option>
                      {cities.map((city) => {
                        const value = city.city_id ?? city.id ?? city.cityId;
                        const label = city.city_name ?? city.name ?? city.cityName;
                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="text-sm font-ui font-semibold text-gray-700">
                    Kecamatan
                    <select
                      value={form.district_id}
                      onChange={(e) => {
                        setForm({
                          ...form,
                          district_id: e.target.value,
                          subdistrict_id: '',
                        });
                      }}
                      disabled={!districts.length}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                    >
                      <option value="">Pilih kecamatan</option>
                      {districts.map((district) => {
                        const value = district.district_id ?? district.id ?? district.districtId;
                        const label = district.district ?? district.name ?? district.district_name;
                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="text-sm font-ui font-semibold text-gray-700">
                    Kelurahan
                    <select
                      value={form.subdistrict_id}
                      onChange={(e) => setForm({ ...form, subdistrict_id: e.target.value })}
                      disabled={!subdistricts.length}
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                    >
                      <option value="">Pilih kelurahan</option>
                      {subdistricts.map((sub) => {
                        const value = sub.subdistrict_id ?? sub.id ?? sub.subdistrictId;
                        const label = sub.subdistrict_name ?? sub.name ?? sub.subdistrict;
                        return (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                  <label className="text-sm font-ui font-semibold text-gray-700">
                    Kode Pos
                    <input
                      type="text"
                      value={form.postal_code}
                      onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                      placeholder="Pilih kode pos"
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                    />
                  </label>
                  <label className="text-sm font-ui font-semibold text-gray-700 md:col-span-2">
                    Alamat Lengkap
                    <input
                      type="text"
                      value={form.alamat_lengkap}
                      onChange={(e) => setForm({ ...form, alamat_lengkap: e.target.value })}
                      placeholder="Nama jalan, Gedung, No.Rumah / Blok"
                      className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                    />
                  </label>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-ui">{error}</p>
                </div>
              )}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm font-ui">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-lg font-ui font-semibold text-[16px] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import bgLogin from '../assets/images/bg-login.jpeg';

const RegisterPage = () => {
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({
    nama_lengkap: '',
    username: '',
    email: '',
    password: '',
    role: 'pelanggan',
    province_id: '',
    province_name: '',
    city_id: '',
    city_name: '',
    district_id: '',
    district_name: '',
    subdistrict_id: '',
    subdistrict_name: '',
    postal_code: '',
    alamat_lengkap: '',
    no_hp: '',
  });
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const { data } = await api.get('/shipping/provinces');
        setProvinces(data.data ?? data ?? []);
      } catch (err) {
        console.error('Error loading provinces:', err);
      }
    };
    loadProvinces();
  }, []);

  const handleProvinceChange = async (value) => {
    const selected = provinces.find(
      (p) => String(p.province_id ?? p.id ?? p.provinceId) === value,
    );
    setForm((prev) => ({
      ...prev,
      province_id: value,
      province_name: selected?.province ?? selected?.name ?? selected?.province_name ?? '',
      city_id: '',
      city_name: '',
      district_id: '',
      district_name: '',
      subdistrict_id: '',
      subdistrict_name: '',
    }));
    if (value) {
      try {
        const { data } = await api.get(`/shipping/cities/${value}`);
        setCities(data.data ?? data ?? []);
      } catch (err) {
        console.error('Error loading cities:', err);
        setCities([]);
      }
    } else {
      setCities([]);
      setDistricts([]);
      setSubdistricts([]);
    }
  };

  const handleCityChange = async (value) => {
    const selected = cities.find(
      (c) => String(c.city_id ?? c.id ?? c.cityId) === value,
    );
    setForm((prev) => ({
      ...prev,
      city_id: value,
      city_name: selected?.city_name ?? selected?.name ?? selected?.cityName ?? '',
      district_id: '',
      district_name: '',
      subdistrict_id: '',
      subdistrict_name: '',
      postal_code: selected?.postal_code ?? prev.postal_code,
    }));
    if (value) {
      try {
        const { data } = await api.get(`/shipping/districts/${value}`);
        setDistricts(data.data ?? data ?? []);
      } catch (err) {
        console.error('Error loading districts:', err);
        setDistricts([]);
      }
    } else {
      setDistricts([]);
      setSubdistricts([]);
    }
  };

  const handleDistrictChange = async (value) => {
    const selected = districts.find(
      (d) => String(d.district_id ?? d.id ?? d.districtId) === value,
    );
    setForm((prev) => ({
      ...prev,
      district_id: value,
      district_name: selected?.district ?? selected?.name ?? selected?.district_name ?? '',
      subdistrict_id: '',
      subdistrict_name: '',
    }));
    if (value) {
      try {
        const { data } = await api.get(`/shipping/subdistricts/${value}`);
        setSubdistricts(data.data ?? data ?? []);
      } catch (err) {
        console.error('Error loading subdistricts:', err);
        setSubdistricts([]);
      }
    } else {
      setSubdistricts([]);
    }
  };

  const handleSubdistrictChange = (value) => {
    const selected = subdistricts.find(
      (s) => String(s.subdistrict_id ?? s.id ?? s.subdistrictId) === value,
    );
    setForm((prev) => ({
      ...prev,
      subdistrict_id: value,
      subdistrict_name: selected?.subdistrict_name ?? selected?.name ?? selected?.subdistrict ?? '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch {
      // error handled via context
    }
  };

  const inputStyle = {
    borderColor: '#D2001A',
  };

  const inputFocusStyle = {
    borderColor: '#D2001A',
    boxShadow: '0 0 0 2px rgba(210, 0, 26, 0.2)',
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background dengan overlay merah */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgLogin}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom right, rgba(210, 0, 26, 0.5), rgba(210, 0, 26, 0.45), rgba(180, 0, 22, 0.5))',
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="pt-8 px-4 sm:px-8 lg:px-16 xl:px-[150px]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-white font-ui font-semibold text-base rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#D2001A' }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-20 px-4 sm:px-8 lg:px-16 xl:px-[150px]">
          {/* Welcome Text */}
          <div className="text-center mb-8 max-w-4xl">
            <h1 className="text-white font-ui font-bold text-3xl sm:text-4xl lg:text-[48px] mb-4">
              Hai, Selamat Datang!
            </h1>
            <p className="text-white font-ui font-normal text-base sm:text-lg lg:text-[18px] max-w-2xl mx-auto">
              Daftarkan akun Anda dan nikmati kemudahan transaksi serta penawaran menarik untuk pelanggan dari reseller
            </p>
          </div>

          {/* Register Form */}
          <div className="w-full max-w-[700px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <h2
              className="font-ui font-bold text-2xl sm:text-[28px] mb-6 text-center"
              style={{ color: '#D2001A' }}
            >
              Daftar Akun
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informasi Akun Section */}
              <div className="space-y-4">
                <h3 className="font-ui font-semibold text-lg text-slate-700 border-b pb-2" style={{ borderColor: '#D2001A' }}>
                  Informasi Akun
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      value={form.nama_lengkap}
                      onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Username"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="No. Telp"
                      value={form.no_hp}
                      onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="Kata Sandi"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>

                  <div>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="pelanggan">Pelanggan</option>
                      <option value="reseller">Reseller</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Alamat Section */}
              <div className="space-y-4 pt-4">
                <h3 className="font-ui font-semibold text-lg text-slate-700 border-b pb-2" style={{ borderColor: '#D2001A' }}>
                  Alamat Pengiriman
                </h3>

                <div>
                  <select
                    value={form.province_id}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D2001A';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  >
                    <option value="">Pilih Provinsi</option>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={form.city_id}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                      disabled={!cities.length}
                    >
                      <option value="">Pilih Kota/Kabupaten</option>
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
                  </div>

                  <div>
                    <select
                      value={form.district_id}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                      disabled={!districts.length}
                    >
                      <option value="">Pilih Kecamatan</option>
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
                  </div>

                  <div>
                    <select
                      value={form.subdistrict_id}
                      onChange={(e) => handleSubdistrictChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                      disabled={!subdistricts.length}
                    >
                      <option value="">Pilih Kelurahan</option>
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
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Kode Pos"
                      value={form.postal_code}
                      onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                      className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2001A';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    placeholder="Alamat Lengkap"
                    value={form.alamat_lengkap}
                    onChange={(e) => setForm({ ...form, alamat_lengkap: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none transition-all resize-none"
                    style={inputStyle}
                    onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D2001A';
                      e.target.style.boxShadow = 'none';
                    }}
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm" style={{ color: '#D2001A' }}>
                  {error}
                </p>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 rounded-lg text-white font-ui font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                style={{ backgroundColor: '#D2001A' }}
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-black font-ui font-normal text-base">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="font-ui font-semibold hover:underline"
                  style={{ color: '#D2001A' }}
                >
                  Masuk di sini.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

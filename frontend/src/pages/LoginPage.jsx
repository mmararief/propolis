import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import bgLogin from '../assets/images/bg-login.jpeg';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/');
    } catch {
      // error handled via context
    }
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
            background: 'linear-gradient(to bottom right, rgba(210, 0, 26, 0.5), rgba(210, 0, 26, 0.45), rgba(180, 0, 22, 0.5))'
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
              Selamat Datang Kembali!
            </h1>
            <p className="text-white font-ui font-normal text-base sm:text-lg lg:text-[18px] max-w-2xl mx-auto">
              Kelola pesanan, pantau stok, dan nikmati kemudahan berbelanja produk kesehatan original kami hanya dengan satu akun.
            </p>
          </div>

          {/* Login Form */}
          <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <h2 
              className="font-ui font-bold text-2xl sm:text-[28px] mb-6 text-center"
              style={{ color: '#D2001A' }}
            >
              Masuk Akun
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Username / Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: '#D2001A',
                    focusBorderColor: '#D2001A',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#D2001A';
                    e.target.style.boxShadow = '0 0 0 2px rgba(210, 0, 26, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D2001A';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-black font-ui font-normal text-sm">
                    Kata Sandi
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-ui font-normal text-sm hover:underline"
                    style={{ color: '#D2001A' }}
                  >
                    Lupa kata sandi?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Kata Sandi"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: '#D2001A',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#D2001A';
                    e.target.style.boxShadow = '0 0 0 2px rgba(210, 0, 26, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D2001A';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm" style={{ color: '#D2001A' }}>
                  {error}
                </p>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 rounded-lg text-white font-ui font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#D2001A' }}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-black font-ui font-normal text-base">
                Belum punya akun?{' '}
                <Link
                  to="/register"
                  className="font-ui font-semibold hover:underline"
                  style={{ color: '#D2001A' }}
                >
                  Daftar di sini.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

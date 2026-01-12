import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import bgLogin from '../assets/images/bg-login.jpeg';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    const [email, setEmail] = useState(emailParam || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // If no token, redirect to login or show error
    useEffect(() => {
        if (!token) {
            setError('Token tidak valid atau tidak ditemukan.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (password !== passwordConfirmation) {
            setError('Konfirmasi password tidak cocok.');
            setLoading(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await axios.post(`${apiUrl}/api/auth/reset-password`, {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            setMessage(response.data.message || 'Password Anda telah berhasil direset! Silakan login kembali.');

            // Redirect to login after a brief delay
            setTimeout(() => {
                navigate('/login');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Terjadi kesalahan saat mereset password.');
        } finally {
            setLoading(false);
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
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center pt-8 pb-20 px-4 sm:px-8 lg:px-16 xl:px-[150px]">
                    {/* Welcome Text */}
                    <div className="text-center mb-8 max-w-4xl">
                        <h1 className="text-white font-ui font-bold text-3xl sm:text-4xl lg:text-[48px] mb-4">
                            Buat Kata Sandi Baru
                        </h1>
                        <p className="text-white font-ui font-normal text-base sm:text-lg lg:text-[18px] max-w-2xl mx-auto">
                            Silakan masukkan kata sandi baru Anda. Pastikan kata sandi aman dan mudah diingat.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
                        <h2
                            className="font-ui font-bold text-2xl sm:text-[28px] mb-6 text-center"
                            style={{ color: '#D2001A' }}
                        >
                            Reset Kata Sandi
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input (Read Only or Editable) */}
                            <div>
                                <label className="text-black font-ui font-normal text-sm mb-1 block">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    readOnly={!!emailParam}
                                    className="w-full px-4 py-3 border-2 rounded-lg font-ui font-normal text-base outline-none bg-gray-100 cursor-not-allowed"
                                    style={{
                                        borderColor: '#ccc',
                                    }}
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="text-black font-ui font-normal text-sm mb-1 block">Kata Sandi Baru</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Min. 8 karakter"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                            {/* Password Confirmation Input */}
                            <div>
                                <label className="text-black font-ui font-normal text-sm mb-1 block">Konfirmasi Kata Sandi Baru</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    placeholder="Ulangi kata sandi"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
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

                            {/* Message / Error */}
                            {message && (
                                <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                    {message}
                                </div>
                            )}
                            {error && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || !token}
                                className="w-full px-6 py-4 rounded-lg text-white font-ui font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#D2001A' }}
                            >
                                {loading ? 'Memproses...' : 'Simpan Password Baru'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;

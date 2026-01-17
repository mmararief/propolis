import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import { SkeletonProgressBar, SkeletonText, SkeletonButton } from '../components/Skeleton';
import { getProductImageUrl } from '../utils/imageHelper';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileSizeError, setFileSizeError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animateProgress, setAnimateProgress] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  const fetchOrder = async () => {
    if (!orderId || isNaN(orderId) || parseInt(orderId) <= 0) {
      setError('ID pesanan tidak valid');
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat detail pesanan';
      setError(errorMsg);
      if (errorMsg.includes('tidak valid') || errorMsg.includes('tidak ditemukan')) {
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && orderId !== 'undefined' && orderId !== '0') {
      fetchOrder();
    } else if (!orderId) {
      setError('ID pesanan tidak ditemukan di URL');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  useEffect(() => {
    if (order && !loading) {
      // Trigger animasi setelah order dimuat
      setTimeout(() => setAnimateProgress(true), 100);
    }
  }, [order, loading]);

  // Countdown timer untuk expired order
  useEffect(() => {
    if (!order || order.status !== 'belum_dibayar' || order.status === 'expired') {
      return;
    }

    const orderDate = new Date(order.ordered_at || order.created_at);
    const expiryDate = new Date(orderDate.getTime() + 60 * 60 * 1000); // 1 jam dari order date
    const now = new Date();

    if (now >= expiryDate) {
      setIsExpired(true);
      setTimeRemaining(null);
        // Update status order menjadi expired
        if (order.status === 'belum_dibayar') {
          api.post(`/orders/${orderId}/expire`)
            .then((response) => {
              if (response.data?.data) {
                setOrder(response.data.data);
              }
            })
            .catch(() => {
              // Jika endpoint error, update local state saja
              setOrder({ ...order, status: 'expired' });
            });
        }
        return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = expiryDate - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining(null);
        // Update status order menjadi expired
        if (order.status === 'belum_dibayar') {
          api.post(`/orders/${orderId}/expire`)
            .then((response) => {
              if (response.data?.data) {
                setOrder(response.data.data);
              }
            })
            .catch(() => {
              // Jika endpoint error, update local state saja
              setOrder({ ...order, status: 'expired' });
            });
        }
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status, order?.ordered_at, order?.created_at, orderId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFileSizeError(null);
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validasi ukuran file (2 MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024; // 2 MB dalam bytes
    if (selectedFile.size > maxSize) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setFileSizeError(`Ukuran file terlalu besar (${fileSizeMB} MB). Maksimal ukuran file adalah 2 MB.`);
      setFile(null);
      // Reset input file
      e.target.value = '';
      return;
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileSizeError('Format file tidak didukung. Gunakan format JPG, PNG, atau PDF.');
      setFile(null);
      e.target.value = '';
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    // Validasi ulang sebelum upload
    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileSizeError(`Ukuran file terlalu besar (${fileSizeMB} MB). Maksimal ukuran file adalah 2 MB.`);
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);
    setFileSizeError(null);
    try {
      const formData = new FormData();
      formData.append('bukti', file);
      await api.post(`/orders/${orderId}/upload-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Bukti pembayaran berhasil diunggah.');
      setFile(null);
      fetchOrder();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal mengunggah bukti pembayaran';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const cancelOrder = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`);
      setMessage('Pesanan berhasil dibatalkan.');
      setError(null);
      fetchOrder();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal membatalkan pesanan');
    }
  };

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const getStatusText = (status) => {
    const statusMap = {
      belum_dibayar: 'Menunggu Pembayaran',
      menunggu_konfirmasi: 'Menunggu Konfirmasi Pembayaran',
      diproses: 'Pesanan Diproses',
      dikirim: 'Pesanan Dikirim',
      selesai: 'Pesanan Selesai',
      dibatalkan: 'Dibatalkan',
      expired: 'Kedaluwarsa',
      kadaluwarsa: 'Kedaluwarsa',
    };
    return statusMap[status] || status.replace('_', ' ');
  };

  const getProgressSteps = (order) => {
    const steps = [
      {
        id: 'created',
        label: 'Pesanan Dibuat',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        date: order?.created_at,
        completed: true,
      },
      {
        id: 'paid',
        label: 'Pesanan Dibayar',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
        date: order?.paid_at,
        completed: ['menunggu_konfirmasi', 'diproses', 'dikirim', 'selesai'].includes(order?.status),
      },
      {
        id: 'confirmed',
        label: 'Pembayaran Dikonfirmasi',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        date: order?.confirmed_at,
        completed: ['diproses', 'dikirim', 'selesai'].includes(order?.status),
      },
      {
        id: 'shipped',
        label: 'Pesanan Dikirim',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        date: order?.shipped_at,
        completed: ['dikirim', 'selesai'].includes(order?.status),
      },
      {
        id: 'completed',
        label: 'Pesanan Selesai',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        date: order?.completed_at,
        completed: order?.status === 'selesai',
      },
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="relative bg-white min-h-screen overflow-x-hidden pt-[100px] pb-20">
        <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px] pt-16">
          {/* Breadcrumbs Skeleton */}
          <div className="flex items-center gap-2 mb-8">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>

          {/* Order Header Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <SkeletonProgressBar />
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Address Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            </div>

            {/* Products Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b">
                    <div className="w-16 h-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="h-px bg-gray-200 my-2"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="flex gap-4">
            <SkeletonButton className="w-32" />
            <SkeletonButton className="w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="relative bg-white min-h-screen overflow-x-hidden pt-[100px] pb-20">
        <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px] pt-16">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-500 font-ui">{error}</p>
            <Link
              to="/orders"
              className="inline-block mt-4 px-6 py-3 rounded-lg text-white font-ui font-semibold text-[16px] hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#D2001A' }}
            >
              Kembali ke Pesanan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const steps = getProgressSteps(order);
  const subtotal = order.total - (order.ongkos_kirim || 0);
  const trackingSummary = order?.tracking_payload?.summary;
  const trackingHistory = Array.isArray(order?.tracking_payload?.history)
    ? order.tracking_payload.history
    : [];

  // Hitung seberapa jauh progress untuk garis utama
  const lastCompletedIndex = steps.reduce(
    (acc, step, index) => (step.completed ? index : acc),
    -1
  );
  const completedWidthPercent =
    steps.length > 1 && lastCompletedIndex > 0
      ? (lastCompletedIndex / (steps.length - 1)) * 100
      : 0;

  return (
    <div className="relative bg-white min-h-screen overflow-x-hidden pt-[100px] pb-20">
      <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 xl:px-[150px] pt-16">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-4 sm:mb-8 flex-wrap">
          <Link
            to="/"
            className="font-ui font-normal text-xs sm:text-[16px] text-black hover:opacity-70 transition-colors"
          >
            Beranda
          </Link>
          <span className="font-ui font-normal text-xs sm:text-[16px] text-black"> &gt; </span>
          <Link
            to="/orders"
            className="font-ui font-normal text-xs sm:text-[16px] text-black hover:opacity-70 transition-colors"
          >
            Pesanan
          </Link>
          <span className="font-ui font-normal text-xs sm:text-[16px] text-black"> &gt; </span>
          <span
            className="font-ui font-normal text-xs sm:text-[16px]"
            style={{ color: '#D2001A' }}
          >
            Detail Pesanan
          </span>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="font-ui font-bold text-base sm:text-lg text-gray-900">
                NO. PESANAN {order.id}
              </p>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <p
                className="font-ui font-semibold text-sm sm:text-base"
                style={{ color: '#D2001A' }}
              >
                {getStatusText(order.status)}
              </p>
            </div>
          </div>

          {/* Countdown Timer - hanya tampil jika status belum_dibayar atau expired */}
          {(order.status === 'belum_dibayar' || order.status === 'expired') && (
            <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border-2 ${
              isExpired || order.status === 'expired' || (timeRemaining && timeRemaining.hours === 0 && timeRemaining.minutes < 5)
                ? 'bg-red-50 border-red-300'
                : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 mt-0.5 sm:mt-0 ${isExpired || order.status === 'expired' ? 'text-red-600' : 'text-yellow-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  {isExpired || order.status === 'expired' ? (
                    <div>
                      <p className="font-ui font-bold text-red-700 text-sm sm:text-lg mb-1">
                        ⚠️ Waktu Pembayaran Telah Habis
                      </p>
                      <p className="font-ui text-xs sm:text-sm text-red-600">
                        Pesanan Anda telah kadaluwarsa. Silakan buat pesanan baru.
                      </p>
                    </div>
                  ) : timeRemaining ? (
                    <div>
                      <p className="font-ui font-semibold text-gray-900 mb-1 text-xs sm:text-sm">
                        Waktu Tersisa untuk Pembayaran:
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="font-ui font-bold text-xl sm:text-2xl" style={{ color: '#D2001A' }}>
                            {String(timeRemaining.hours).padStart(2, '0')}
                          </span>
                          <span className="font-ui text-gray-600">:</span>
                          <span className="font-ui font-bold text-xl sm:text-2xl" style={{ color: '#D2001A' }}>
                            {String(timeRemaining.minutes).padStart(2, '0')}
                          </span>
                          <span className="font-ui text-gray-600">:</span>
                          <span className="font-ui font-bold text-xl sm:text-2xl" style={{ color: '#D2001A' }}>
                            {String(timeRemaining.seconds).padStart(2, '0')}
                          </span>
                        </div>
                        <span className="font-ui text-xs sm:text-sm text-gray-600">
                          ({timeRemaining.hours} jam {timeRemaining.minutes} menit {timeRemaining.seconds} detik)
                        </span>
                      </div>
                      {timeRemaining.hours === 0 && timeRemaining.minutes < 5 && (
                        <p className="font-ui text-xs sm:text-sm text-red-600 mt-2">
                          ⚠️ Waktu pembayaran akan segera habis! Segera lakukan pembayaran.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="font-ui text-xs sm:text-sm text-gray-600">Menghitung waktu tersisa...</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="relative py-4 sm:py-6 px-2 sm:px-6 lg:px-12">
            {/* Desktop Layout */}
            <div className="hidden lg:block relative">
              {/* Container untuk garis yang dibatasi */}
              <div className="relative">
                {/* Garis dasar (abu) - hanya antar bulatan */}
                <div 
                  className="absolute top-10 h-1 bg-gray-200" 
                  style={{ 
                    left: '40px',
                    right: '40px'
                  }}
                />
                {/* Garis progress (merah) dengan animasi */}
                <div
                  className="absolute top-10 h-1 bg-[#D2001A] transition-all duration-1500 ease-out"
                  style={{ 
                    left: '40px',
                    width: animateProgress ? `calc(${completedWidthPercent}% - 80px)` : '0',
                    transformOrigin: 'left center'
                  }}
                />
                {/* Titik status */}
                <div className="relative flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className="flex flex-col items-center"
                      style={{
                        animation: animateProgress ? `fadeInUp 0.6s ease-out ${index * 0.15}s both` : 'none'
                      }}
                    >
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 border-4 shadow-md transition-all duration-500 ${
                          step.completed
                            ? 'text-white border-[#D2001A] scale-100'
                            : 'text-gray-400 border-gray-300 bg-white scale-90'
                        }`}
                        style={
                          step.completed
                            ? { 
                                backgroundColor: '#D2001A',
                                animation: 'pulse 2s ease-in-out infinite'
                              }
                            : {}
                        }
                      >
                        {step.icon}
                      </div>
                      <p
                        className={`font-ui font-semibold text-sm text-center mb-1 transition-colors duration-300 ${
                          step.completed ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="font-ui text-xs text-gray-500 text-center animate-fade-in">
                          {formatDate(step.date)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Layout - Vertical */}
            <div className="lg:hidden relative">
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const isLast = index === steps.length - 1;
                  return (
                    <div 
                      key={step.id} 
                      className="flex items-start gap-3"
                      style={{
                        animation: animateProgress ? `fadeInUp 0.6s ease-out ${index * 0.15}s both` : 'none'
                      }}
                    >
                      {/* Vertical Line */}
                      {!isLast && (
                        <div className="flex flex-col items-center pt-2">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-3 shadow-md transition-all duration-500 flex-shrink-0 ${
                              step.completed
                                ? 'text-white border-[#D2001A]'
                                : 'text-gray-400 border-gray-300 bg-white'
                            }`}
                            style={
                              step.completed
                                ? { 
                                    backgroundColor: '#D2001A'
                                  }
                                : {}
                            }
                          >
                            {React.cloneElement(step.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                          </div>
                          <div
                            className={`w-0.5 flex-1 mt-2 ${
                              step.completed && steps[index + 1]?.completed
                                ? 'bg-[#D2001A]'
                                : 'bg-gray-200'
                            }`}
                            style={{ minHeight: '40px' }}
                          />
                        </div>
                      )}
                      {isLast && (
                        <div className="flex flex-col items-center pt-2">
                          <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 sm:border-3 shadow-md transition-all duration-500 flex-shrink-0 ${
                              step.completed
                                ? 'text-white border-[#D2001A]'
                                : 'text-gray-400 border-gray-300 bg-white'
                            }`}
                            style={
                              step.completed
                                ? { 
                                    backgroundColor: '#D2001A'
                                  }
                                : {}
                            }
                          >
                            {React.cloneElement(step.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                          </div>
                        </div>
                      )}
                      {/* Content */}
                      <div className="flex-1 pt-1 pb-4">
                        <p
                          className={`font-ui font-semibold text-xs sm:text-sm mb-1 transition-colors duration-300 ${
                            step.completed ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="font-ui text-xs text-gray-500 animate-fade-in">
                            {formatDate(step.date)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* CSS Animations */}
          <style>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(210, 0, 26, 0.4);
              }
              50% {
                transform: scale(1.05);
                box-shadow: 0 0 0 8px rgba(210, 0, 26, 0);
              }
            }
            
            .animate-fade-in {
              animation: fadeIn 0.8s ease-out;
            }
            
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
          `}</style>
        </div>

        {/* Main Content - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Left Column - Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-ui font-semibold mb-3 sm:mb-4 text-gray-900">
              Alamat Pengiriman
            </h2>
            <div className="space-y-2">
              <p className="font-ui font-medium text-sm sm:text-base text-gray-900">
                {order.phone ? `(+62) ${order.phone.replace(/^0/, '')}` : '-'}
              </p>
              <p className="font-ui text-xs sm:text-sm text-gray-700 break-words">
                {order.address || 'Alamat tidak tersedia'}
              </p>
            </div>
          </div>

          {/* Right Column - Products */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-ui font-semibold mb-3 sm:mb-4 text-gray-900">
              Produk yang dibeli
            </h2>
            <div className="space-y-4">
              {(order.items ?? []).map((item) => {
                // Calculate pack info if exists
                let packQuantity = item.jumlah;
                let packPrice = item.harga_satuan || 0;
                let totalPrice = packPrice * packQuantity;
                
                if (item.product_variant_pack?.pack_size) {
                  const packSize = item.product_variant_pack.pack_size;
                  packQuantity = Math.floor(item.jumlah / packSize);
                  // If pack has harga_pack, use it; otherwise calculate from harga_satuan
                  if (item.product_variant_pack.harga_pack) {
                    packPrice = item.product_variant_pack.harga_pack;
                    totalPrice = packPrice * packQuantity;
                  } else {
                    // Fallback: harga_satuan is already per unit, multiply by pack_size
                    packPrice = (item.harga_satuan || 0) * packSize;
                    totalPrice = packPrice * packQuantity;
                  }
                }
                
                const variantLabel = item.product_variant?.tipe || '';
                const packLabel = item.product_variant_pack?.label || '';
                
                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pb-4 border-b last:border-0 last:pb-0"
                  >
                    <div className="w-16 h-16 bg-[#f1f1f1] rounded flex items-center justify-center shrink-0 overflow-hidden relative self-start sm:self-center">
                      {item.product?.gambar ? (
                        <>
                          <img
                            src={getProductImageUrl(item.product.gambar)}
                            alt={item.product?.nama_produk || 'produk'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <span className="text-xs text-slate-400 hidden">Gambar</span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">Gambar</span>
                      )}
                    </div>
                    <div className="grow min-w-0">
                      <p className="font-ui font-medium text-sm sm:text-base text-gray-900 mb-1 break-words">
                        {item.product?.nama_produk ?? item.product_id}
                      </p>
                      {(variantLabel || packLabel) && (
                        <div className="mb-1 text-xs text-slate-600 space-y-0.5">
                          {variantLabel && (
                            <p className="break-words">
                              <span className="font-semibold">Varian:</span> {variantLabel}
                            </p>
                          )}
                          {packLabel && (
                            <p className="break-words">
                              <span className="font-semibold">Paket:</span> {packLabel}
                            </p>
                          )}
                        </div>
                      )}
                      <p className="font-ui text-xs sm:text-sm text-gray-500">
                        {item.product_variant_pack?.pack_size ? (
                          <>
                            {packQuantity} paket × {item.product_variant_pack.pack_size} botol = {item.jumlah} botol
                          </>
                        ) : (
                          <>x {item.jumlah}</>
                        )}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="font-ui font-semibold text-sm sm:text-base text-gray-900">
                        {formatPrice(packPrice)}
                      </p>
                      {item.product_variant_pack?.pack_size && (
                        <p className="font-ui text-xs text-gray-500">per paket</p>
                      )}
                      <p className="font-ui font-medium text-xs sm:text-sm text-gray-700 mt-1">
                        Total: {formatPrice(totalPrice)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tracking History */}
        {order.resi && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-ui font-semibold text-gray-900 mb-1">Riwayat Pengiriman</h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Update terakhir: {order.tracking_last_checked_at ? formatDate(order.tracking_last_checked_at) : 'Belum ada'}
                </p>
              </div>
              {order.resi && (
                <div className="text-left sm:text-right">
                  <p className="text-xs uppercase text-gray-500">Nomor Resi</p>
                  <p className="font-mono font-semibold text-sm sm:text-base text-gray-900 break-all">{order.resi}</p>
                </div>
              )}
            </div>
            {trackingSummary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-700">
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-1">Kurir</p>
                  <p className="font-semibold break-words">{trackingSummary.courier || `${order.courier ?? '-'} ${order.courier_service ?? ''}`}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-1">Layanan</p>
                  <p className="font-semibold break-words">{trackingSummary.service || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-1">Status Terkini</p>
                  <p className="font-semibold text-[#D2001A] break-words">{trackingSummary.status || order.tracking_status || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-1">Berat / Biaya</p>
                  <p className="font-semibold break-words">{trackingSummary.weight || '-'} • {trackingSummary.amount || '-'}</p>
                </div>
              </div>
            )}
            {trackingHistory.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-slate-600">
                Belum ada riwayat pelacakan. Status akan muncul otomatis setelah kurir memperbarui data.
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {trackingHistory.map((entry, index) => (
                  <div key={`${entry.date}-${index}`} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="w-full sm:w-32 text-xs text-gray-500 flex-shrink-0">{entry.date ? formatDate(entry.date) : '-'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 break-words">{entry.desc || '-'}</p>
                      {entry.location && (
                        <p className="text-xs text-gray-500 mt-1 break-words">{entry.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-ui font-semibold mb-3 sm:mb-4 text-gray-900">
            Ringkasan Pesanan
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between font-ui text-gray-700 text-sm sm:text-base">
              <span>Subtotal Produk</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-ui text-gray-700 text-sm sm:text-base">
              <span>Subtotal Pengiriman</span>
              <span>{formatPrice(order.ongkos_kirim || 0)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between font-ui font-bold text-base sm:text-lg" style={{ color: '#D2001A' }}>
              <span>Total Pesanan</span>
              <span>{formatPrice(order.total || 0)}</span>
            </div>
            <div className="flex justify-between font-ui text-gray-700 mt-3 sm:mt-4 text-sm sm:text-base">
              <span>Metode Pembayaran</span>
              <span className="font-semibold">{order.metode_pembayaran || 'BCA'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          {['belum_dibayar', 'menunggu_konfirmasi'].includes(order.status) && (
            <button
              onClick={cancelOrder}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 rounded-lg font-ui font-semibold text-sm sm:text-[16px] transition-colors hover:bg-red-50"
              style={{ borderColor: '#DC2626', color: '#DC2626' }}
            >
              Batalkan Pesanan
            </button>
          )}
          {order.bukti_pembayaran_url && (
            <a
              href={order.bukti_pembayaran_url}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 rounded-lg font-ui font-semibold text-sm sm:text-[16px] transition-colors hover:bg-gray-50 text-center"
              style={{ borderColor: '#D2001A', color: '#D2001A' }}
            >
              Lihat Bukti
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-ui font-semibold text-sm sm:text-[16px] text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#D2001A' }}
          >
            Cetak Tagihan
          </button>
        </div>

        {/* Upload Proof Section (if not uploaded yet and order is still valid) */}
        {!order.bukti_pembayaran_url && 
         order.status === 'belum_dibayar' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
            <h2 className="text-lg sm:text-xl font-ui font-semibold mb-3 sm:mb-4 text-gray-900">
              Upload Bukti Pembayaran
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">
              Format: JPG, PNG, atau PDF. Ukuran maksimal: <span className="font-semibold">2 MB</span>
            </p>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,.pdf,application/pdf"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-ui text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                  required
                  disabled={order.status === 'expired' || order.status === 'dibatalkan'}
                />
                {file && (
                  <p className="mt-2 text-xs sm:text-sm text-gray-600 font-ui">
                    File dipilih: <span className="font-semibold">{file.name}</span> ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>
              {fileSizeError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-xs sm:text-sm font-ui flex items-start gap-2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{fileSizeError}</span>
                  </p>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-xs sm:text-sm font-ui">{error}</p>
                </div>
              )}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-xs sm:text-sm font-ui">{message}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={uploading || !file || !!fileSizeError}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-ui font-semibold text-sm sm:text-[16px] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#D2001A' }}
              >
                {uploading ? 'Mengunggah...' : 'Upload Bukti'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;

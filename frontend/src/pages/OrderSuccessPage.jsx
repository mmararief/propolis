import { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);

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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    setMessage(null);
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
      setError(err.message);
    } finally {
      setUploading(false);
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
          <Link
            to="/orders"
            className="font-ui font-normal text-[16px] text-black hover:opacity-70 transition-colors"
          >
            Pesanan
          </Link>
          <span className="font-ui font-normal text-[16px] text-black"> &gt; </span>
          <span
            className="font-ui font-normal text-[16px]"
            style={{ color: '#D2001A' }}
          >
            Detail Pesanan
          </span>
        </div>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <p className="font-ui font-bold text-lg text-gray-900">
                NO. PESANAN {order.id}
              </p>
              <div className="w-px h-6 bg-gray-300"></div>
              <p
                className="font-ui font-semibold text-base"
                style={{ color: '#D2001A' }}
              >
                {getStatusText(order.status)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        step.completed
                          ? 'text-white'
                          : 'text-gray-400 bg-gray-100'
                      }`}
                      style={
                        step.completed
                          ? { backgroundColor: '#D2001A' }
                          : {}
                      }
                    >
                      {step.icon}
                    </div>
                    <p
                      className={`font-ui font-medium text-xs text-center mb-1 ${
                        step.completed ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="font-ui text-xs text-gray-500 text-center">
                        {formatDate(step.date)}
                      </p>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        step.completed
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                      }`}
                      style={
                        step.completed
                          ? { backgroundColor: '#D2001A' }
                          : {}
                      }
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-ui font-semibold mb-4 text-gray-900">
              Alamat Pengiriman
            </h2>
            <div className="space-y-2">
              <p className="font-ui font-medium text-gray-900">
                {order.phone ? `(+62) ${order.phone.replace(/^0/, '')}` : '-'}
              </p>
              <p className="font-ui text-gray-700">
                {order.address || 'Alamat tidak tersedia'}
              </p>
            </div>
          </div>

          {/* Right Column - Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-ui font-semibold mb-4 text-gray-900">
              Produk yang dibeli
            </h2>
            <div className="space-y-4">
              {(order.items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                >
                  <div className="w-16 h-16 bg-[#f1f1f1] rounded flex items-center justify-center shrink-0 overflow-hidden relative">
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
                  <div className="grow">
                    <p className="font-ui font-medium text-gray-900 mb-1">
                      {item.product?.nama_produk ?? item.product_id}
                    </p>
                    <p className="font-ui text-sm text-gray-500">Variasi: Botol</p>
                    <p className="font-ui text-sm text-gray-500">x {item.jumlah}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-ui font-semibold text-gray-900">
                      {formatPrice(item.harga_satuan || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-ui font-semibold mb-4 text-gray-900">
            Ringkasan Pesanan
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between font-ui text-gray-700">
              <span>Subtotal Produk</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-ui text-gray-700">
              <span>Subtotal Pengiriman</span>
              <span>{formatPrice(order.ongkos_kirim || 0)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between font-ui font-bold text-lg" style={{ color: '#D2001A' }}>
              <span>Total Pesanan</span>
              <span>{formatPrice(order.total || 0)}</span>
            </div>
            <div className="flex justify-between font-ui text-gray-700 mt-4">
              <span>Metode Pembayaran</span>
              <span className="font-semibold">{order.metode_pembayaran || 'BCA'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {order.bukti_pembayaran_url && (
            <a
              href={order.bukti_pembayaran_url}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 border-2 rounded-lg font-ui font-semibold text-[16px] transition-colors hover:bg-gray-50"
              style={{ borderColor: '#D2001A', color: '#D2001A' }}
            >
              Lihat Bukti
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-lg font-ui font-semibold text-[16px] text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#D2001A' }}
          >
            Cetak Tagihan
          </button>
        </div>

        {/* Upload Proof Section (if not uploaded yet) */}
        {!order.bukti_pembayaran_url && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-ui font-semibold mb-4 text-gray-900">
              Upload Bukti Pembayaran
            </h2>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-ui text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                  style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm font-ui">{error}</p>}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-ui">{message}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={uploading || !file}
                className="px-6 py-3 rounded-lg font-ui font-semibold text-[16px] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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

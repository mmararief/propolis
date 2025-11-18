import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { SkeletonOrderCard } from '../components/Skeleton';
import ProfileSidebar from '../components/ProfileSidebar';

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/orders/me');
      const ordersList = data.data?.data ?? data.data ?? [];
      setOrders(Array.isArray(ordersList) ? ordersList : []);
      if (Array.isArray(ordersList) && ordersList.length >= 0) {
        setError(null);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      if (errorMsg && !errorMsg.includes('ID pesanan tidak valid')) {
        setError(errorMsg);
        setSuccessMessage(null);
      } else {
        setError(null);
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
      diproses: 'Sedang Diproses',
      dikirim: 'Sedang Dikirim',
      selesai: 'Pesanan Selesai',
      dibatalkan: 'Dibatalkan',
      expired: 'Kedaluwarsa',
    };
    return statusMap[status] || status.replace('_', ' ');
  };

  const confirmDelivery = async (orderId) => {
    if (!window.confirm('Pesanan sudah diterima?')) return;
    try {
      await api.post(`/orders/${orderId}/confirm-delivery`);
      setSuccessMessage('Terima kasih! Pesanan ditandai selesai.');
      setError(null);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal mengkonfirmasi pesanan');
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
          <span
            className="font-ui font-normal text-[16px]"
            style={{ color: '#D2001A' }}
          >
            Pesanan Saya
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-ui font-bold text-[48px] mb-8 uppercase text-center"
          style={{ color: '#D2001A' }}
        >
          PESANAN SAYA
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - User Profile */}
          <ProfileSidebar activeTab="orders" />

          {/* Right Panel - Orders List */}
          <div className="grow space-y-6">
            {loading && (
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonOrderCard key={index} />
                ))}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-red-500 font-ui">{error}</p>
              </div>
            )}

            {!loading && !error && orders.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-slate-600 font-ui text-lg mb-4">Belum ada pesanan.</p>
                <Link
                  to="/products"
                  className="inline-block px-6 py-3 rounded-lg text-white font-ui font-semibold text-[16px] hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  Belanja Sekarang
                </Link>
              </div>
            )}

            {!loading && !error && orders.length > 0 && (
              <>
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    {/* Order Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <p className="font-ui font-bold text-lg text-gray-900 mb-1">
                            NO. PESANAN {order.id}
                          </p>
                          <p
                            className="font-ui font-semibold text-base mb-1"
                            style={{ color: '#D2001A' }}
                          >
                            {getStatusText(order.status)}
                          </p>
                          <p className="font-ui font-normal text-sm text-gray-500">
                            Dibuat Pada Tanggal {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {(order.items ?? []).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0"
                          >
                            <div className="w-16 h-16 bg-[#f1f1f1] rounded flex items-center justify-center shrink-0">
                              <span className="text-xs text-slate-400">Gambar</span>
                            </div>
                            <div className="grow">
                              <p className="font-ui font-medium text-gray-900 mb-1">
                                {item.product?.nama_produk ?? item.product_id}
                              </p>
                              <p className="font-ui text-sm text-gray-500">Variasi: Botol</p>
                              <p className="font-ui text-sm text-gray-500">x{item.jumlah}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-ui font-semibold text-gray-900">
                                {formatPrice(item.harga_satuan || 0)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total Order */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <p className="font-ui font-semibold text-lg text-gray-900">Total Pesanan:</p>
                          <p
                            className="font-ui font-bold text-2xl"
                            style={{ color: '#D2001A' }}
                          >
                            {formatPrice(order.total || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          onClick={() => {
                            // TODO: Implement contact admin functionality
                            window.open('https://wa.me/6281234567891', '_blank');
                          }}
                          className="px-6 py-2 border-2 rounded-lg font-ui font-semibold text-[14px] transition-colors hover:bg-gray-50"
                          style={{ borderColor: '#D2001A', color: '#D2001A' }}
                        >
                          Hubungi Admin
                        </button>
                        {order.status === 'dikirim' && (
                          <button
                            onClick={() => confirmDelivery(order.id)}
                            className="px-6 py-2 rounded-lg font-ui font-semibold text-[14px] text-white hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: '#0B9D58' }}
                          >
                            Konfirmasi Diterima
                          </button>
                        )}
                        <Link
                          to={`/orders/success/${order.id}`}
                          className="px-6 py-2 rounded-lg font-ui font-semibold text-[14px] text-white hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: '#D2001A' }}
                        >
                          Lihat Detail
                        </Link>
                        {order.status === 'selesai' && (
                          <button
                            disabled
                            className="px-6 py-2 rounded-lg font-ui font-semibold text-[14px] text-gray-400 bg-gray-100 cursor-not-allowed"
                          >
                            Pesanan Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;

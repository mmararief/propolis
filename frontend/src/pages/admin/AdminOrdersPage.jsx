import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import AdminOrderDetailModal from '../../components/AdminOrderDetailModal';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/orders', {
        params: status ? { status } : undefined,
      });
      setOrders(data.data?.data ?? data.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const verifyOrder = async (id) => {
    try {
      await api.post(`/admin/orders/${id}/verify-payment`);
      setMessage(`Order #${id} berhasil diverifikasi`);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal verifikasi order');
    }
  };

  const shipOrder = async (id) => {
    const resi = window.prompt('Masukkan nomor resi');
    if (!resi || !resi.trim()) return;
    try {
      await api.post(`/admin/orders/${id}/ship`, { resi });
      setMessage(`Order #${id} berhasil dikirim dengan resi: ${resi}`);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal mengirim order');
    }
  };

  const markDelivered = async (id) => {
    if (!window.confirm('Tandai pesanan ini sudah diterima pelanggan?')) return;
    try {
      await api.post(`/admin/orders/${id}/mark-delivered`);
      setMessage(`Order #${id} ditandai selesai`);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menandai pesanan');
    }
  };

  const openDetailModal = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrderId(null);
  };

  const releaseReservations = async () => {
    try {
      await api.post('/admin/run-reservation-release');
      setMessage('Job pelepasan reservasi dijalankan');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menjalankan job');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatChannel = (channel) => {
    if (!channel) return 'online';
    const mapping = {
      online: 'Website',
      offline: 'Offline',
      shopee: 'Shopee',
      tokopedia: 'Tokopedia',
      tiktokshop: 'TikTok Shop',
      whatsapp: 'WhatsApp',
      lainnya: 'Lainnya',
    };
    return mapping[channel] || channel;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      belum_dibayar: { label: 'Belum Dibayar', color: 'bg-red-100 text-red-700' },
      menunggu_konfirmasi: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-100 text-yellow-700' },
      diproses: { label: 'Diproses', color: 'bg-blue-100 text-blue-700' },
      dikirim: { label: 'Dikirim', color: 'bg-purple-100 text-purple-700' },
      selesai: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
      dibatalkan: { label: 'Dibatalkan', color: 'bg-gray-100 text-gray-700' },
      expired: { label: 'Kedaluwarsa', color: 'bg-orange-100 text-orange-700' },
    };
    const config = statusConfig[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
    return (
      <span className={`badge-status ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTotalItems = (order) => {
    if (!order.items) return 0;
    return order.items.reduce((sum, item) => sum + (item.jumlah || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Pesanan</h1>
          <p className="text-sm text-slate-500">Verifikasi pembayaran, input resi, dan monitoring status pesanan.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="input-field w-52"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="belum_dibayar">Belum Dibayar</option>
            <option value="menunggu_konfirmasi">Menunggu Konfirmasi</option>
            <option value="diproses">Diproses</option>
            <option value="dikirim">Dikirim</option>
            <option value="selesai">Selesai</option>
            <option value="dibatalkan">Dibatalkan</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
          <button type="button" className="btn-outline" onClick={releaseReservations}>
            Release Reservasi Expired
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/admin/orders/manual')}
          >
            + Tambah Pesanan
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-600 text-sm">{message}</p>
        </div>
      )}

      {/* Orders Table */}
      <div className="card space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Memuat data pesanan...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-2">Tidak ada pesanan</p>
            <p className="text-sm text-slate-400">
              {status ? `dengan status "${status}"` : 'saat ini'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200">
                  <th className="py-3 font-semibold text-slate-900">ID</th>
                  <th className="py-3 font-semibold text-slate-900">Channel</th>
                  <th className="py-3 font-semibold text-slate-900">Tanggal</th>
                  <th className="py-3 font-semibold text-slate-900">Customer</th>
                  <th className="py-3 font-semibold text-slate-900">Items</th>
                  <th className="py-3 font-semibold text-slate-900">Total</th>
                  <th className="py-3 font-semibold text-slate-900">Status</th>
                  <th className="py-3 font-semibold text-slate-900">Resi</th>
                  <th className="py-3 font-semibold text-slate-900">Bukti</th>
                  <th className="py-3 font-semibold text-slate-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3">
                      <span className="font-semibold text-slate-900">#{order.id}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        {formatChannel(order.channel)}
                      </span>
                      {order.external_order_id && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Ref: {order.external_order_id}
                        </p>
                      )}
                    </td>
                    <td className="py-3 text-slate-600 text-xs">
                      {formatDate(order.ordered_at || order.created_at)}
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {order.customer_name || order.user?.nama_lengkap || '-'}
                        </p>
                        {(order.customer_email || order.user?.email) && (
                          <p className="text-xs text-slate-500">
                            {order.customer_email || order.user?.email}
                          </p>
                        )}
                        {order.phone && (
                          <p className="text-[11px] text-slate-400">{order.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">
                      {getTotalItems(order)} item
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-slate-900">
                        Rp {Number(order.total || order.total_harga).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3">
                      {order.resi ? (
                        <span className="font-mono text-xs text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          {order.resi}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3">
                      {order.bukti_pembayaran_url ? (
                        <a
                          href={order.bukti_pembayaran_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block"
                        >
                          <img
                            src={order.bukti_pembayaran_url}
                            alt="Bukti pembayaran"
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200 hover:border-blue-400 transition"
                          />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Belum ada</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          className="btn-outline px-3 py-1 text-xs"
                          onClick={() => openDetailModal(order.id)}
                        >
                          Detail
                        </button>
                        {order.status === 'menunggu_konfirmasi' && (
                          <button
                            type="button"
                            className="btn-primary px-3 py-1 text-xs"
                            onClick={() => verifyOrder(order.id)}
                          >
                            Verifikasi
                          </button>
                        )}
                        {order.status === 'diproses' && (
                          <button
                            type="button"
                            className="btn-primary px-3 py-1 text-xs"
                            onClick={() => shipOrder(order.id)}
                          >
                            Kirim
                          </button>
                        )}
                        {order.status === 'dikirim' && (
                          <button
                            type="button"
                            className="btn-primary px-3 py-1 text-xs bg-green-600 hover:bg-green-700"
                            onClick={() => markDelivered(order.id)}
                          >
                            Tandai Selesai
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AdminOrderDetailModal
        orderId={selectedOrderId}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        onStatusUpdated={fetchOrders}
      />
    </div>
  );
};

export default AdminOrdersPage;

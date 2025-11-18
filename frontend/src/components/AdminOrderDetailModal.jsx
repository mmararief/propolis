import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

const channelLabel = {
  online: 'Website',
  offline: 'Offline',
  shopee: 'Shopee',
  tokopedia: 'Tokopedia',
  tiktokshop: 'TikTok Shop',
  whatsapp: 'WhatsApp',
  lainnya: 'Lainnya',
};

const AdminOrderDetailModal = ({ orderId, isOpen, onClose, onStatusUpdated }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/admin/orders/${orderId}`);
      setOrder(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [fetchOrderDetail, isOpen, orderId]);

  const handleMarkDelivered = async () => {
    if (!orderId || !order) return;
    if (!window.confirm('Tandai pesanan ini selesai?')) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await api.post(`/admin/orders/${orderId}/mark-delivered`);
      await fetchOrderDetail();
      onStatusUpdated?.();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Gagal menandai pesanan');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            Detail Pesanan #{orderId}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <p className="text-slate-600">Memuat data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {actionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{actionError}</p>
            </div>
          )}

          {order && !loading && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Customer</p>
                  <p className="font-semibold text-slate-900">
                    {order.customer_name || order.user?.nama_lengkap || '-'}
                  </p>
                  {(order.customer_email || order.user?.email) && (
                    <p className="text-xs text-slate-500 mt-1">
                      {order.customer_email || order.user?.email}
                    </p>
                  )}
                  {order.phone && (
                    <p className="text-xs text-slate-500 mt-1">Telp: {order.phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <span className="badge-status capitalize">{order.status}</span>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Channel</p>
                  <p className="font-semibold text-slate-900">
                    {channelLabel[order.channel] || order.channel || 'Online'}
                  </p>
                  {order.external_order_id && (
                    <p className="text-xs text-slate-500 mt-1">
                      Ref: {order.external_order_id}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Tanggal Pesanan</p>
                  <p className="font-semibold text-slate-900">
                    {(order.ordered_at || order.created_at)
                      ? new Date(order.ordered_at || order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Metode Pembayaran</p>
                  <p className="font-semibold text-slate-900">
                    {order.metode_pembayaran || '-'}
                  </p>
                </div>
                {order.resi && (
                  <div>
                    <p className="text-sm text-slate-500">Nomor Resi</p>
                    <p className="font-semibold text-slate-900 font-mono">{order.resi}</p>
                  </div>
                )}
                {order.courier && (
                  <div>
                    <p className="text-sm text-slate-500">Kurir</p>
                    <p className="font-semibold text-slate-900">
                      {order.courier} {order.courier_service ? `- ${order.courier_service}` : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Ringkasan Pembayaran</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-900">
                      Rp {Number(order.subtotal || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  {order.ongkos_kirim && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ongkos Kirim:</span>
                      <span className="font-semibold text-slate-900">
                        Rp {Number(order.ongkos_kirim).toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">Total:</span>
                    <span className="font-bold text-lg text-slate-900">
                      Rp {Number(order.total || order.total_harga).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items with Batch Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Daftar Produk & Batch
                </h3>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">
                            {item.product?.nama_produk || 'Produk tidak ditemukan'}
                          </h4>
                          <p className="text-sm text-slate-600">
                            Qty: {item.jumlah} × Rp{' '}
                            {Number(item.harga_satuan).toLocaleString('id-ID')} = Rp{' '}
                            {Number(item.total_harga).toLocaleString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          {item.allocated ? (
                            <span className="badge-status bg-green-100 text-green-700">
                              Dialokasikan
                            </span>
                          ) : (
                            <span className="badge-status bg-yellow-100 text-yellow-700">
                              Belum Dialokasikan
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Batch Information */}
                      {item.batches && item.batches.length > 0 ? (
                        <div className="mt-3 pt-3 border-t border-slate-200 bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-semibold text-blue-900 mb-2">
                            📦 Batch yang Harus Dikirim:
                          </p>
                          <div className="space-y-2">
                            {item.batches.map((allocation, idx) => (
                              <div
                                key={idx}
                                className="bg-white border border-blue-200 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-bold text-slate-900 text-base">
                                      Batch: <span className="text-blue-600">{allocation.batch?.batch_number || 'N/A'}</span>
                                    </p>
                                    <div className="mt-1 space-y-1">
                                      <p className="text-sm text-slate-700">
                                        <span className="font-medium">Jumlah:</span> {allocation.qty} unit
                                      </p>
                                      {allocation.batch?.expiry_date && (
                                        <p className="text-sm text-slate-700">
                                          <span className="font-medium">Tanggal Kadaluarsa:</span>{' '}
                                          {new Date(allocation.batch.expiry_date).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                          })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-blue-700 mt-2 italic">
                            ⚠️ Pastikan produk dengan nomor batch di atas yang dikirim!
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 pt-3 border-t border-slate-200 bg-amber-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-amber-800">
                            ⚠️ Batch belum dialokasikan. Verifikasi pembayaran terlebih dahulu untuk melihat informasi batch.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {(order.address || order.destination_city_name || order.destination_province_name) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Alamat Pengiriman
                  </h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    {order.customer_name && (
                      <p className="font-semibold text-slate-900">{order.customer_name}</p>
                    )}
                    {order.address && <p className="text-slate-700">{order.address}</p>}
                    {order.phone && (
                      <p className="text-sm text-slate-600">
                        Telp: {order.phone}
                      </p>
                    )}
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {[
                        { label: 'Provinsi', value: order.destination_province_name },
                        { label: 'Kota/Kabupaten', value: order.destination_city_name },
                        { label: 'Kecamatan', value: order.destination_district_name },
                        { label: 'Kelurahan', value: order.destination_subdistrict_name },
                        { label: 'Kode Pos', value: order.destination_postal_code },
                      ]
                        .filter((item) => item.value)
                        .map((item) => (
                          <div key={item.label}>
                            <p className="text-slate-500 text-xs">{item.label}</p>
                            <p className="font-medium text-slate-900">{item.value}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-outline"
          >
            Tutup
          </button>
          {order && order.status === 'dikirim' && (
            <button
              onClick={handleMarkDelivered}
              className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-60"
              disabled={actionLoading}
            >
              {actionLoading ? 'Memproses...' : 'Tandai Selesai'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailModal;


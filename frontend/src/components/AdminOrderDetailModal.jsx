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
  const [codeInputs, setCodeInputs] = useState({});
  const [codeError, setCodeError] = useState(null);
  const [codeMessage, setCodeMessage] = useState(null);
  const [isSavingCodes, setIsSavingCodes] = useState(false);

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

  useEffect(() => {
    if (!order) return;

    const initialCodes = {};
    order.items?.forEach((item) => {
      // Handle both snake_case and camelCase from Laravel API response
      const existingCodes = item.product_codes || item.productCodes || [];
      const normalized = Array.from({ length: item.jumlah || 0 }).map((_, idx) => existingCodes[idx]?.kode_produk || '');
      initialCodes[item.id] = normalized;
    });
    setCodeInputs(initialCodes);
    setCodeError(null);
    setCodeMessage(null);
  }, [order]);

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

  const handleCancelOrder = async () => {
    if (!orderId || !order) return;
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini? Stok akan dikembalikan.')) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await api.post(`/admin/orders/${orderId}/cancel`);
      await fetchOrderDetail();
      onStatusUpdated?.();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Gagal membatalkan pesanan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCodeInputChange = (itemId, index, value) => {
    setCodeInputs((prev) => {
      const next = { ...prev };
      const current = Array.from(next[itemId] || []);
      current[index] = value;
      next[itemId] = current;
      return next;
    });
  };

  const handleSaveCodes = async () => {
    if (!orderId || !order || order.status !== 'diproses') return;

    setCodeError(null);
    setCodeMessage(null);

    const payloadItems = [];
    const allCodes = [];

    for (const item of order.items || []) {
      const codes = Array.from(codeInputs[item.id] || []).map((code) => code.trim());

      if (codes.length !== item.jumlah) {
        setCodeError(`Lengkapi ${item.jumlah} kode untuk ${item.product?.nama_produk || 'produk'}`);
        return;
      }

      if (codes.some((code) => !code)) {
        setCodeError('Semua kode produk harus terisi tanpa spasi kosong');
        return;
      }

      payloadItems.push({
        order_item_id: item.id,
        kode_produk: codes,
      });
      allCodes.push(...codes);
    }

    if (allCodes.length === 0) {
      setCodeError('Isi minimal satu kode produk sebelum menyimpan');
      return;
    }

    const seen = new Set();
    for (const code of allCodes) {
      if (seen.has(code)) {
        setCodeError('Kode produk tidak boleh duplikat dalam satu pesanan');
        return;
      }
      seen.add(code);
    }

    setIsSavingCodes(true);
    try {
      await api.post(`/admin/orders/${orderId}/product-codes`, {
        items: payloadItems,
      });
      setCodeMessage('Kode produk berhasil disimpan');
      await fetchOrderDetail();
      onStatusUpdated?.();
    } catch (err) {
      setCodeError(err.response?.data?.message || err.message || 'Gagal menyimpan kode produk');
    } finally {
      setIsSavingCodes(false);
    }
  };

  const canEditCodes = order?.status === 'diproses';

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

          {order?.status === 'diproses' && codeError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{codeError}</p>
            </div>
          )}

          {order?.status === 'diproses' && codeMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700">{codeMessage}</p>
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

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Daftar Produk & Kode
                </h3>
                <div className="space-y-4">
                  {order.items?.map((item) => {
                    // Calculate pack info if exists
                    let packQuantity = item.jumlah;
                    let packPrice = item.harga_satuan || 0;
                    let totalPrice = item.total_harga || (packPrice * packQuantity);

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
                        className="border border-slate-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">
                              {item.product?.nama_produk || 'Produk tidak ditemukan'}
                            </h4>
                            {(variantLabel || packLabel) && (
                              <div className="mt-1 mb-2 text-xs text-slate-600 space-y-0.5">
                                {variantLabel && (
                                  <p>
                                    <span className="font-semibold">Varian:</span> {variantLabel}
                                  </p>
                                )}
                                {packLabel && (
                                  <p>
                                    <span className="font-semibold">Paket:</span> {packLabel}
                                  </p>
                                )}
                              </div>
                            )}
                            <p className="text-sm text-slate-600">
                              {item.product_variant_pack?.pack_size ? (
                                <>
                                  {packQuantity} paket × {item.product_variant_pack.pack_size} botol = {item.jumlah} botol
                                </>
                              ) : (
                                <>Qty: {item.jumlah}</>
                              )}
                              {' × Rp '}
                              {Number(packPrice).toLocaleString('id-ID')}
                              {item.product_variant_pack?.pack_size && ' (per paket)'}
                              {' = Rp '}
                              {Number(totalPrice).toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-slate-900">Kode Produk</p>
                            <span className="text-xs text-slate-500">
                              {canEditCodes ? 'Wajib diisi sebelum kirim' : 'Tidak dapat diubah pada status ini'}
                            </span>
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            {Array.from({ length: item.jumlah }).map((_, idx) => (
                              <input
                                key={`${item.id}-code-${idx}`}
                                type="text"
                                value={codeInputs[item.id]?.[idx] ?? ''}
                                onChange={(e) => handleCodeInputChange(item.id, idx, e.target.value)}
                                disabled={!canEditCodes}
                                className="input-field font-mono text-sm"
                                placeholder={`Kode produk #${idx + 1}`}
                              />
                            ))}
                          </div>
                          {((item.product_codes || item.productCodes)?.length > 0) && !canEditCodes && (
                            <p className="text-xs text-slate-500 mt-1">
                              Kode tersimpan: {(item.product_codes || item.productCodes).map((code) => code.kode_produk).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {canEditCodes && order.items?.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      className="btn-primary disabled:opacity-50"
                      onClick={handleSaveCodes}
                      disabled={isSavingCodes}
                    >
                      {isSavingCodes ? 'Menyimpan...' : 'Simpan Semua Kode Produk'}
                    </button>
                  </div>
                )}
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
          {order && ['belum_dibayar', 'menunggu_konfirmasi', 'diproses'].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              className="btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 disabled:opacity-60"
              disabled={actionLoading}
            >
              {actionLoading ? 'Memproses...' : 'Batalkan Pesanan'}
            </button>
          )}
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


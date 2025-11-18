import { useState } from 'react';
import api from '../api/client';

const OrderLookupPage = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async (e) => {
    e.preventDefault();
    const id = orderId.trim();
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      setError('ID pesanan harus berupa angka yang valid');
      return;
    }
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Pesanan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lacak Pesanan</h1>
        <p className="text-sm text-slate-500">Masukkan ID order untuk melihat status terbaru.</p>
      </div>
      <form onSubmit={handleFetch} className="flex flex-col md:flex-row gap-3">
        <input
          className="input-field flex-1"
          value={orderId}
          placeholder="Contoh: 1001"
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Memuat...' : 'Cari'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {order && (
        <div className="rounded-xl border border-slate-100 p-4 space-y-3">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Order #{order.id}</h3>
            <span className="badge-status capitalize">{order.status}</span>
          </div>
          <p className="text-sm text-slate-500">Total: Rp {Number(order.total).toLocaleString('id-ID')}</p>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Item</h4>
            <ul className="space-y-1 text-sm text-slate-600">
              {(order.items ?? []).map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.product?.nama_produk ?? item.product_id} x {item.jumlah}
                  </span>
                  <span>Rp {Number(item.harga_satuan).toLocaleString('id-ID')}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderLookupPage;


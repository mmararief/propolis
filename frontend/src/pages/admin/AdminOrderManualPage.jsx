import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const channelOptions = [
  { value: 'offline', label: 'Offline / Walk-in' },
  { value: 'online', label: 'Website' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'tokopedia', label: 'Tokopedia' },
  { value: 'tiktokshop', label: 'TikTok Shop' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'lainnya', label: 'Lainnya' },
];

const statusOptions = [
  { value: 'belum_dibayar', label: 'Belum Dibayar' },
  { value: 'menunggu_konfirmasi', label: 'Menunggu Konfirmasi' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'dikirim', label: 'Dikirim' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
];

const paymentOptions = [
  { value: 'transfer_manual', label: 'Transfer Manual' },
  { value: 'BCA', label: 'BCA' },
  { value: 'BSI', label: 'BSI' },
  { value: 'gopay', label: 'GoPay' },
  { value: 'dana', label: 'Dana' },
];

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 9);
};

const createEmptyItem = () => ({
  id: generateId(),
  product_id: '',
  qty: 1,
  price: '',
});

const AdminOrderManualPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    channel: 'offline',
    external_order_id: '',
    ordered_at: new Date().toISOString().slice(0, 16),
    status: 'diproses',
    metode_pembayaran: 'transfer_manual',
    courier: 'manual',
    courier_service: '',
    shipping_cost: 0,
    customer: {
      name: '',
      email: '',
      phone: '',
      address: '',
      province_id: '',
      province_name: '',
      city_id: '',
      city_name: '',
      district_id: '',
      district_name: '',
      subdistrict_id: '',
      subdistrict_name: '',
      postal_code: '',
    },
  });
  const [items, setItems] = useState([createEmptyItem()]);
  const [products, setProducts] = useState([]);
  const [priceTiers, setPriceTiers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchProvinces();
    fetchPriceTiers();
  }, []);

  const fetchPriceTiers = async () => {
    try {
      const { data } = await api.get('/admin/price-tiers');
      setPriceTiers(data.data ?? data ?? []);
    } catch (err) {
      console.error('Error loading price tiers:', err);
    }
  };

  useEffect(() => {
    if (form.customer.province_id) {
      fetchCities(form.customer.province_id);
    } else {
      setCities([]);
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [form.customer.province_id]);

  useEffect(() => {
    if (form.customer.city_id) {
      fetchDistricts(form.customer.city_id);
    } else {
      setDistricts([]);
      setSubdistricts([]);
    }
  }, [form.customer.city_id]);

  useEffect(() => {
    if (form.customer.district_id) {
      fetchSubdistricts(form.customer.district_id);
    } else {
      setSubdistricts([]);
    }
  }, [form.customer.district_id]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data } = await api.get('/products', { params: { per_page: 100 } });
      setProducts(data.data?.data ?? data.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchProvinces = async () => {
    try {
      const { data } = await api.get('/shipping/provinces');
      setProvinces(data.data ?? data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCities = async (provinceId) => {
    try {
      const { data } = await api.get(`/shipping/cities/${provinceId}`);
      setCities(data.data ?? data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDistricts = async (cityId) => {
    try {
      const { data } = await api.get(`/shipping/districts/${cityId}`);
      setDistricts(data.data ?? data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubdistricts = async (districtId) => {
    try {
      const { data } = await api.get(`/shipping/subdistricts/${districtId}`);
      setSubdistricts(data.data ?? data ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerChange = (field, value) => {
    setForm((prev) => {
      const updated = {
        ...prev,
        customer: {
          ...prev.customer,
          [field]: value,
        },
      };

      if (field === 'province_id') {
        const selected = provinces.find(
          (province) => String(province.province_id ?? province.id) === String(value),
        );
        updated.customer.province_name = selected ? selected.province ?? selected.name ?? '' : '';
        updated.customer.city_id = '';
        updated.customer.city_name = '';
        updated.customer.district_id = '';
        updated.customer.district_name = '';
        updated.customer.subdistrict_id = '';
        updated.customer.subdistrict_name = '';
        updated.customer.postal_code = '';
      }

      if (field === 'city_id') {
        const selectedCity = cities.find((city) => String(city.city_id ?? city.id) === String(value));
        const cityLabel = selectedCity
          ? selectedCity.type
            ? `${selectedCity.type} ${selectedCity.city_name}`
            : selectedCity.city_name ?? selectedCity.name ?? ''
          : '';
        updated.customer.city_name = cityLabel;
        updated.customer.district_id = '';
        updated.customer.district_name = '';
        updated.customer.subdistrict_id = '';
        updated.customer.subdistrict_name = '';
        updated.customer.postal_code = '';
      }

      if (field === 'district_id') {
        const selectedDistrict = districts.find(
          (district) => String(district.subdistrict_id ?? district.id) === String(value),
        );
        updated.customer.district_name = selectedDistrict
          ? selectedDistrict.subdistrict_name ?? selectedDistrict.name ?? ''
          : '';
        updated.customer.subdistrict_id = '';
        updated.customer.subdistrict_name = '';
        updated.customer.postal_code = '';
      }

      if (field === 'subdistrict_id') {
        const selectedSubdistrict = subdistricts.find(
          (subdistrict) => String(subdistrict.subdistrict_id ?? subdistrict.id) === String(value),
        );
        updated.customer.subdistrict_name = selectedSubdistrict
          ? selectedSubdistrict.subdistrict_name ?? selectedSubdistrict.name ?? ''
          : '';
        updated.customer.postal_code = selectedSubdistrict?.postal_code ?? '';
      }

      return updated;
    });
  };

  const getPriceTierForQty = (qty) => {
    if (!qty || qty <= 0) return null;
    const qtyNum = Number(qty);
    
    // Cari tier yang sesuai dengan qty
    const matchingTier = priceTiers
      .filter(tier => tier.min_jumlah <= qtyNum && (!tier.max_jumlah || tier.max_jumlah >= qtyNum))
      .sort((a, b) => b.min_jumlah - a.min_jumlah)[0]; // Ambil tier dengan min_jumlah terbesar
    
    return matchingTier;
  };

  const calculatePriceFromTier = (tier, qty) => {
    if (!tier || !qty) return null;
    // harga_total adalah total untuk min_jumlah, jadi hitung harga per item
    const pricePerItem = tier.harga_total / tier.min_jumlah;
    return pricePerItem * Number(qty);
  };

  const updateItem = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (field === 'product_id') {
          const product = products.find((p) => p.id === Number(value));
          return {
            ...item,
            product_id: value,
            price: product ? product.harga_ecer ?? 0 : item.price,
          };
        }
        if (field === 'qty') {
          // Saat qty berubah, cek apakah ada tier yang sesuai dan update harga jika perlu
          const updatedItem = { ...item, qty: value };
          const tier = getPriceTierForQty(value);
          if (tier) {
            const suggestedPrice = tier.harga_total / tier.min_jumlah;
            // Hanya update harga jika user belum mengubahnya secara manual
            // Atau jika harga saat ini sama dengan harga dari tier sebelumnya
            const currentTier = getPriceTierForQty(item.qty);
            if (!currentTier || item.price === (currentTier.harga_total / currentTier.min_jumlah)) {
              updatedItem.price = suggestedPrice;
            }
          }
          return updatedItem;
        }
        return { ...item, [field]: value };
      }),
    );
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItemRow = (itemId) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== itemId)));
  };

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const qty = Number(item.qty) || 0;
        const price = Number(item.price) || 0;
        return sum + qty * price;
      }, 0),
    [items],
  );

  const grandTotal = subtotal + (Number(form.shipping_cost) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const preparedItems = items
      .filter((item) => item.product_id)
      .map((item) => ({
        product_id: Number(item.product_id),
        qty: Number(item.qty) || 0,
        price: Number(item.price) || 0,
      }));

    if (preparedItems.length === 0) {
      setError('Minimal pilih 1 produk.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        channel: form.channel,
        external_order_id: form.external_order_id || null,
        ordered_at: form.ordered_at ? new Date(form.ordered_at).toISOString() : null,
        status: form.status,
        metode_pembayaran: form.metode_pembayaran,
        courier: form.courier || null,
        courier_service: form.courier_service || null,
        shipping_cost: Number(form.shipping_cost) || 0,
        customer: {
          name: form.customer.name,
          email: form.customer.email || null,
          phone: form.customer.phone,
          address: form.customer.address,
          province_id: form.customer.province_id || null,
          province_name: form.customer.province_name || null,
          city_id: form.customer.city_id || null,
          city_name: form.customer.city_name || null,
          district_id: form.customer.district_id || null,
          district_name: form.customer.district_name || null,
          subdistrict_id: form.customer.subdistrict_id || null,
          subdistrict_name: form.customer.subdistrict_name || null,
          postal_code: form.customer.postal_code || null,
        },
        items: preparedItems,
      };

      const { data } = await api.post('/admin/orders/manual', payload);
      setMessage('Pesanan manual berhasil dibuat');
      setTimeout(() => {
        navigate(`/admin/orders`);
      }, 1200);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal membuat pesanan manual');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tambah Pesanan Manual</h1>
          <p className="text-sm text-slate-500">
            Gunakan form ini untuk mencatat penjualan offline atau marketplace lain.
          </p>
        </div>
        <button type="button" className="btn-outline" onClick={() => navigate(-1)}>
          Kembali
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Meta */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Informasi Pesanan</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Channel</label>
              <select
                className="input-field w-full"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                {channelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Referensi</label>
              <input
                className="input-field w-full"
                placeholder="Contoh: SHOPEE-12345"
                value={form.external_order_id}
                onChange={(e) => setForm({ ...form, external_order_id: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Order</label>
              <input
                type="datetime-local"
                className="input-field w-full"
                value={form.ordered_at}
                onChange={(e) => setForm({ ...form, ordered_at: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                className="input-field w-full"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</label>
              <select
                className="input-field w-full"
                value={form.metode_pembayaran}
                onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ongkos Kirim</label>
              <input
                type="number"
                className="input-field w-full"
                value={form.shipping_cost}
                onChange={(e) => setForm({ ...form, shipping_cost: e.target.value })}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Customer Section */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Data Customer</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap *</label>
              <input
                className="input-field w-full"
                value={form.customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className="input-field w-full"
                value={form.customer.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">No. Telepon *</label>
              <input
                className="input-field w-full"
                value={form.customer.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap *</label>
              <textarea
                className="input-field w-full"
                rows={3}
                value={form.customer.address}
                onChange={(e) => handleCustomerChange('address', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Provinsi</label>
              <select
                className="input-field w-full"
                value={form.customer.province_id}
                onChange={(e) => handleCustomerChange('province_id', e.target.value)}
              >
                <option value="">Pilih Provinsi</option>
                {provinces.map((province) => (
                  <option key={province.province_id || province.id} value={province.province_id || province.id}>
                    {province.province || province.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kota/Kabupaten</label>
              <select
                className="input-field w-full"
                value={form.customer.city_id}
                onChange={(e) => handleCustomerChange('city_id', e.target.value)}
                disabled={!cities.length}
              >
                <option value="">Pilih Kota</option>
                {cities.map((city) => (
                  <option key={city.city_id || city.id} value={city.city_id || city.id}>
                    {city.type ? `${city.type} ${city.city_name}` : city.city_name || city.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kecamatan</label>
              <select
                className="input-field w-full"
                value={form.customer.district_id}
                onChange={(e) => handleCustomerChange('district_id', e.target.value)}
                disabled={!districts.length}
              >
                <option value="">Pilih Kecamatan</option>
                {districts.map((district) => (
                  <option key={district.subdistrict_id || district.id} value={district.subdistrict_id || district.id}>
                    {district.subdistrict_name || district.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kelurahan</label>
              <select
                className="input-field w-full"
                value={form.customer.subdistrict_id}
                onChange={(e) => handleCustomerChange('subdistrict_id', e.target.value)}
                disabled={!subdistricts.length}
              >
                <option value="">Pilih Kelurahan</option>
                {subdistricts.map((sd) => (
                  <option key={sd.subdistrict_id || sd.id} value={sd.subdistrict_id || sd.id}>
                    {sd.subdistrict_name || sd.name}
                  </option>
                ))}
              </select>
            </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kode Pos</label>
            <input
              className="input-field w-full bg-slate-50"
              value={form.customer.postal_code}
              placeholder="Otomatis dari kelurahan"
              readOnly
            />
          </div>
          </div>
        </div>

        {/* Items */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Produk Dipesan</h2>
            <button type="button" className="btn-outline" onClick={addItemRow}>
              + Tambah Produk
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2">Produk</th>
                  <th className="py-2 w-24">Qty</th>
                  <th className="py-2 w-32">Harga Satuan</th>
                  <th className="py-2 w-32">Subtotal</th>
                  <th className="py-2 w-16 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const selectedProduct = products.find((p) => p.id === Number(item.product_id));
                  const readyStock =
                    selectedProduct?.stok_available ??
                    Math.max(0, (selectedProduct?.stok ?? 0) - (selectedProduct?.stok_reserved ?? 0));
                  const reservedStock = selectedProduct?.stok_reserved ?? 0;

                  return (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 pr-3 align-top">
                        <div className="space-y-2">
                          <select
                            className="input-field w-full"
                            value={item.product_id}
                            onChange={(e) => updateItem(item.id, 'product_id', e.target.value)}
                            disabled={loadingProducts}
                          >
                            <option value="">Pilih Produk</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.nama_produk} ({product.sku})
                              </option>
                            ))}
                          </select>
                          {selectedProduct && (
                            <p className="text-xs text-slate-500">
                              Ready:{' '}
                              <span className="font-semibold text-slate-900">
                                {readyStock}
                              </span>{' '}
                              pcs · Reserved: {reservedStock} pcs
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="number"
                          min="1"
                          className="input-field w-full"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                        />
                        {selectedProduct && readyStock < Number(item.qty || 0) && (
                          <p className="text-[11px] text-red-600 mt-1">
                            Jumlah melebihi stok ready ({readyStock} pcs)
                          </p>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <div className="space-y-1">
                          <input
                            type="number"
                            min="0"
                            className="input-field w-full"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                          />
                          {(() => {
                            const tier = getPriceTierForQty(item.qty);
                            if (tier) {
                              const suggestedPrice = tier.harga_total / tier.min_jumlah;
                              const isUsingTierPrice = Math.abs(Number(item.price) - suggestedPrice) < 0.01;
                              return (
                                <p className="text-[11px] text-slate-500">
                                  {isUsingTierPrice ? (
                                    <span className="text-green-600 font-semibold">
                                      ✓ {tier.label || 'Tier'} ({tier.min_jumlah}
                                      {tier.max_jumlah ? `-${tier.max_jumlah}` : '+'} item)
                                    </span>
                                  ) : (
                                    <span>
                                      Saran: {tier.label || 'Tier'} - Rp{' '}
                                      {suggestedPrice.toLocaleString('id-ID')}/item
                                    </span>
                                  )}
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </td>
                      <td className="py-2 pr-3 font-semibold text-slate-900">
                        Rp {((Number(item.qty) || 0) * (Number(item.price) || 0)).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          className="text-red-500 text-xs font-semibold"
                          onClick={() => removeItemRow(item.id)}
                          disabled={items.length === 1}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Ringkasan</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Ongkos Kirim</span>
                <span className="font-semibold text-slate-900">
                  Rp {(Number(form.shipping_cost) || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold border-t border-slate-200 pt-2">
                <span>Total Estimasi</span>
                <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kurir</label>
                <input
                  className="input-field w-full"
                  value={form.courier}
                  onChange={(e) => setForm({ ...form, courier: e.target.value })}
                  placeholder="Contoh: JNE / Ambil Sendiri"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service/Catatan</label>
                <input
                  className="input-field w-full"
                  value={form.courier_service}
                  onChange={(e) => setForm({ ...form, courier_service: e.target.value })}
                  placeholder="Contoh: COD, Reguler, Ambil toko"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Pesanan'}
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate('/admin/orders')}>
              Batal
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminOrderManualPage;



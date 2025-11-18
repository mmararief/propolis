import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProductImageUrl } from '../utils/imageHelper';
import { getProductPriceTiers, getUnitPriceForQuantity } from '../utils/pricing';

const originCityId = import.meta.env.VITE_ORIGIN_CITY_ID ?? 149;

const CheckoutPage = () => {
  const { items, total, clearCart, totalWeight } = useCart();
  const { user } = useAuth();
  const defaultAddress = user?.addresses?.[0];
  const navigate = useNavigate();
  const [form, setForm] = useState({
    destination_city_id: '',
    destination_district_id: '',
    destination_subdistrict_id: '',
    address: '',
    phone: '',
    metode_pembayaran: 'BCA',
    courier: 'jne',
    courier_service: '',
    ongkos_kirim: 0,
    pesan: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    if (defaultAddress) {
      setForm((prev) => ({
        ...prev,
        destination_city_id: defaultAddress.city_id ?? prev.destination_city_id,
        destination_district_id: defaultAddress.district_id ?? prev.destination_district_id,
        destination_subdistrict_id: defaultAddress.subdistrict_id ?? prev.destination_subdistrict_id,
        address: defaultAddress.address ?? user?.alamat_lengkap ?? '',
        phone: defaultAddress.phone ?? user?.no_hp ?? '',
      }));
    }
  }, [defaultAddress, user]);

  const calculateShipping = async () => {
    const destinationDistrict = form.destination_district_id || defaultAddress?.district_id;
    if (!destinationDistrict) {
      setError('Alamat tujuan belum lengkap (kecamatan belum tersedia).');
      return;
    }
    const weight = Math.max(totalWeight, 1000);
    setShippingLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/shipping/cost', {
        origin: Number(originCityId),
        destination: Number(form.destination_city_id || defaultAddress?.city_id),
        destination_district_id: Number(destinationDistrict),
        weight,
        courier: form.courier || 'jne',
      });
      
      // Handle different API response structures
      let options = [];
      const result = data.data ?? data;
      
      if (Array.isArray(result)) {
        options = result;
      } else if (result?.results) {
        // RajaOngkir format: { results: [{ costs: [...] }] }
        const courierResult = result.results[0];
        if (courierResult?.costs) {
          options = courierResult.costs.map((cost) => ({
            service: cost.service,
            description: cost.description,
            cost: cost.cost?.[0]?.value,
            etd: cost.cost?.[0]?.etd,
            etd_text: cost.cost?.[0]?.etd,
          }));
        }
      } else if (result?.costs) {
        options = result.costs;
      }
      
      setShippingOptions(options);
      
      if (options.length > 0) {
        const first = options[0];
        setSelectedService(first);
        setForm((prev) => ({
          ...prev,
          ongkos_kirim: first.cost ?? first.value ?? 0,
          courier_service: first.service ?? '',
        }));
      } else {
        setError('Tidak ada layanan pengiriman tersedia untuk alamat ini.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menghitung ongkir');
      console.error('Shipping calculation error:', err);
    } finally {
      setShippingLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Keranjang kosong');
      return;
    }
    const cityId = form.destination_city_id || defaultAddress?.city_id;
    const districtId = form.destination_district_id || defaultAddress?.district_id;
    const subdistrictId = form.destination_subdistrict_id || defaultAddress?.subdistrict_id;

    if (!cityId || !districtId) {
      setError('Alamat tujuan belum lengkap. Lengkapi profil terlebih dahulu.');
      return;
    }

    if (!selectedService || !form.courier_service) {
      setError('Silakan hitung ongkir dan pilih layanan pengiriman terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        destination_city_id: Number(cityId),
        destination_district_id: Number(districtId),
        destination_subdistrict_id: subdistrictId ? Number(subdistrictId) : undefined,
        items: items.map((item) => ({
          product_id: item.product.id,
          jumlah: item.qty,
        })),
      };
      const { data } = await api.post('/checkout', payload);
      clearCart();
      navigate(`/orders/success/${data.data?.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = total + (form.ongkos_kirim || 0);
  const enrichedItems = items.map((item) => {
    const tiers = getProductPriceTiers(item.product);
    const { tier: activeTier, unitPrice } = getUnitPriceForQuantity(item.product, item.qty);
    const nextTier = tiers.find((tier) => tier.min_jumlah > item.qty);
    return {
      ...item,
      tiers,
      activeTier,
      unitPrice: unitPrice || item.product.harga_ecer || 0,
      nextTier,
    };
  });

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
            to="/cart"
            className="font-ui font-normal text-[16px] text-black hover:opacity-70 transition-colors"
          >
            Keranjang
          </Link>
          <span className="font-ui font-normal text-[16px] text-black"> &gt; </span>
          <span
            className="font-ui font-normal text-[16px]"
            style={{ color: '#D2001A' }}
          >
            Checkout
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-ui font-bold text-[48px] mb-8 uppercase"
          style={{ color: '#D2001A' }}
        >
          CHECKOUT
        </h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-slate-600 text-lg mb-4">Keranjang kamu masih kosong.</p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 rounded-lg text-white font-ui font-semibold text-[16px] hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#D2001A' }}
            >
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Forms */}
            <div className="grow space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-ui font-semibold mb-4 flex items-center text-gray-900">
                  <span className="mr-2" style={{ color: '#D2001A' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </span>
                  Alamat Pengiriman
                </h2>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-ui font-medium text-gray-900">
                    {user?.nama_lengkap || 'User'} {user?.no_hp ? `(+62) ${user.no_hp}` : ''}
                  </p>
                  <p className="text-gray-600 mt-1 font-ui text-sm">
                    {form.address || defaultAddress?.address || user?.alamat_lengkap || 'Belum ada alamat'}
                    {defaultAddress?.city_name && `, ${defaultAddress.city_name}`}
                    {defaultAddress?.province_name && `, ${defaultAddress.province_name}`}
                    {defaultAddress?.postal_code && `, ${defaultAddress.postal_code}`}
                  </p>
                </div>
              </div>

              {/* Product List */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-ui font-semibold mb-4 flex items-center text-gray-900">
                  <span className="mr-2" style={{ color: '#D2001A' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </span>
                  Produk Dipesan
                </h2>
                <div className="space-y-4">
                  {enrichedItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between py-4 border-b last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#f1f1f1] rounded flex items-center justify-center overflow-hidden relative">
                          {item.product.gambar ? (
                            <img
                              src={getProductImageUrl(item.product.gambar)}
                              alt={item.product.nama_produk}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <span className={`text-xs text-slate-400 ${item.product.gambar ? 'hidden' : ''}`}>Gambar</span>
                        </div>
                        <div>
                          <h3 className="font-ui font-medium text-gray-900">
                            {item.product.nama_produk}
                          </h3>
                          <p className="text-sm text-gray-500 font-ui">Varian: Botol</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-ui font-medium text-gray-900">
                          {formatPrice(item.unitPrice || 250000)}
                        </div>
                        <div className="text-sm text-gray-500 font-ui">Jumlah: {item.qty}</div>
                        {item.activeTier ? (
                          <p className="text-xs text-slate-500">
                            Tier: {item.activeTier.label || `≥ ${item.activeTier.min_jumlah}${item.activeTier.max_jumlah ? ` - ${item.activeTier.max_jumlah}` : ''} pcs`}
                          </p>
                        ) : null}
                        <div
                          className="font-ui font-medium"
                          style={{ color: '#D2001A' }}
                        >
                          {formatPrice((item.unitPrice || 250000) * item.qty)}
                        </div>
                        {item.nextTier && (
                          <p className="text-xs text-slate-500">
                            Tambah {item.nextTier.min_jumlah - item.qty} pcs lagi untuk harga{' '}
                            {item.nextTier.label || `≥ ${item.nextTier.min_jumlah} pcs`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <textarea
                      placeholder="[Opsional] Tinggalkan pesan..."
                      value={form.pesan}
                      onChange={(e) => setForm({ ...form, pesan: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-offset-0 font-ui text-sm"
                      style={{ focusRingColor: '#D2001A', focusBorderColor: '#D2001A' }}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center font-ui text-gray-600">
                    <span>Biaya Pengiriman:</span>
                    <span className="font-medium">
                      {shippingLoading ? 'Menghitung...' : formatPrice(form.ongkos_kirim || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-ui text-gray-600">
                      Total Pesanan ({totalItems} Produk):
                    </span>
                    <span
                      className="font-ui font-medium"
                      style={{ color: '#D2001A' }}
                    >
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-ui font-semibold mb-4 flex items-center text-gray-900">
                  <span className="mr-2" style={{ color: '#D2001A' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </span>
                  Pilih Ekspedisi & Ongkir
                </h2>

                {/* Courier Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-ui font-semibold text-gray-700 mb-2">
                    Pilih Ekspedisi:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['JNE', 'WAHANA', 'LION'].map((courier) => (
                      <button
                        key={courier}
                        type="button"
                        onClick={() => {
                          setForm({ ...form, courier: courier.toLowerCase() });
                          setShippingOptions([]);
                          setSelectedService(null);
                        }}
                        className={`p-3 border rounded-lg text-center font-ui font-semibold transition-colors ${
                          form.courier === courier.toLowerCase()
                            ? 'border-transparent text-white'
                            : 'border-gray-200 hover:border-red-300 text-gray-700'
                        }`}
                        style={
                          form.courier === courier.toLowerCase()
                            ? { backgroundColor: '#D2001A', borderColor: '#D2001A' }
                            : {}
                        }
                      >
                        {courier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculate Shipping Button */}
                {(!form.destination_city_id || !form.destination_district_id) ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-ui text-yellow-800">
                      Lengkapi alamat pengiriman terlebih dahulu untuk menghitung ongkir.
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={calculateShipping}
                      disabled={shippingLoading}
                      className="w-full px-4 py-2 border-2 rounded-lg font-ui font-semibold text-[16px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        borderColor: '#D2001A',
                        color: '#D2001A',
                      }}
                    >
                      {shippingLoading ? 'Menghitung Ongkir...' : 'Hitung Ongkir'}
                    </button>
                  </div>
                )}

                {/* Shipping Options */}
                {shippingOptions.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-sm font-ui font-semibold text-gray-700 mb-2">
                      Pilih Layanan Pengiriman:
                    </label>
                    {shippingOptions.map((option, index) => {
                      const serviceName = option.service || option.description || `Layanan ${index + 1}`;
                      const cost = option.cost || option.value || 0;
                      const etd = option.etd || option.etd_text || '-';
                      const isSelected = selectedService?.service === option.service;

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSelectedService(option);
                            setForm((prev) => ({
                              ...prev,
                              courier_service: option.service || '',
                              ongkos_kirim: cost,
                            }));
                          }}
                          className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                            isSelected
                              ? 'border-transparent'
                              : 'border-gray-200 hover:border-red-300'
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: '#fef2f2', borderColor: '#D2001A' }
                              : {}
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-ui font-semibold text-gray-900">{serviceName}</p>
                              <p className="text-sm font-ui text-gray-500 mt-1">
                                Estimasi: {etd} hari
                              </p>
                            </div>
                            <div
                              className="font-ui font-bold text-lg"
                              style={{ color: '#D2001A' }}
                            >
                              {formatPrice(cost)}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Shipping Info */}
                {selectedService && (
                  <div className="mt-4 bg-gray-50 p-4 rounded">
                    <p className="text-sm font-ui font-medium text-gray-900 mb-1">
                      Layanan Terpilih:
                    </p>
                    <p className="font-ui font-semibold text-gray-900">
                      {form.courier.toUpperCase()} - {selectedService.service || selectedService.description}
                    </p>
                    <p className="text-sm font-ui text-gray-600 mt-1">
                      Ongkir: {formatPrice(form.ongkos_kirim || 0)}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-ui font-semibold mb-4 flex items-center text-gray-900">
                  <span className="mr-2" style={{ color: '#D2001A' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </span>
                  Metode Pembayaran
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  {['BCA', 'BSI', 'Gopay', 'Dana'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setForm({ ...form, metode_pembayaran: method.toUpperCase() })}
                      className={`p-3 border rounded-lg text-center font-ui font-semibold transition-colors ${
                        form.metode_pembayaran === method.toUpperCase()
                          ? 'border-transparent text-white'
                          : 'border-gray-200 hover:border-red-300 text-gray-700'
                      }`}
                      style={
                        form.metode_pembayaran === method.toUpperCase()
                          ? { backgroundColor: '#D2001A', borderColor: '#D2001A' }
                          : {}
                      }
                    >
                      {method}
                    </button>
                  ))}
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-ui font-medium text-gray-900">No. Rekening:</p>
                  <p
                    className="font-ui font-medium mt-1"
                    style={{ color: '#D2001A' }}
                  >
                    1234567890 a/n Dante Propolis
                  </p>
                  <p className="text-sm font-ui mt-2" style={{ color: '#D2001A' }}>
                    Pastikan anda membayar sesuai rekening dengan benar sebelum melakukan
                    transfer. Setelah pembayaran, silahkan tunggu hingga terkonfirmasi untuk
                    verifikasi pesanan Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Order Button */}
            <div className="lg:w-80">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-[120px] space-y-3">
                {!selectedService && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                    Hitung ongkir dan pilih layanan kurir terlebih dahulu untuk melanjutkan.
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || shippingLoading || !selectedService || !form.courier_service}
                  className="w-full py-3 rounded-lg font-ui font-semibold text-[16px] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  {loading ? 'Memproses...' : 'Buat Pesanan'}
                </button>
                {error && (
                  <p className="text-red-500 text-sm font-ui">{error}</p>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

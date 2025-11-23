import { useEffect, useState } from 'react';
import api from '../../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { label: 'Semua Status', value: '' },
  { label: 'Belum Dibayar', value: 'belum_dibayar' },
  { label: 'Menunggu Konfirmasi', value: 'menunggu_konfirmasi' },
  { label: 'Diproses', value: 'diproses' },
  { label: 'Dikirim', value: 'dikirim' },
  { label: 'Selesai', value: 'selesai' },
  { label: 'Dibatalkan', value: 'dibatalkan' },
  { label: 'Expired', value: 'expired' },
];

const CHANNEL_OPTIONS = [
  { label: 'Semua Channel', value: '' },
  { label: 'Online', value: 'online' },
  { label: 'Offline', value: 'offline' },
  { label: 'Shopee', value: 'shopee' },
  { label: 'Tokopedia', value: 'tokopedia' },
  { label: 'Tiktok Shop', value: 'tiktokshop' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Lainnya', value: 'lainnya' },
];

const HISTORY_INTERVAL_OPTIONS = [
  { label: 'Harian', value: 'daily' },
  { label: 'Mingguan', value: 'weekly' },
  { label: 'Bulanan', value: 'monthly' },
];

const TREND_INTERVAL_OPTIONS = [
  { label: 'Harian', value: 'daily' },
  { label: 'Mingguan', value: 'weekly' },
];

const AdminReportsPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState({ sales: false, history: false, trend: false });

  const [salesFilters, setSalesFilters] = useState({
    from: '',
    to: '',
    status: '',
    channel: '',
    search: '',
  });
  const [salesData, setSalesData] = useState({ rows: [], meta: null });

  const [historyFilters, setHistoryFilters] = useState({
    from: '',
    to: '',
    interval: 'monthly',
  });
  const [historyData, setHistoryData] = useState({ products: [], segments: [] });
  const [trendInterval, setTrendInterval] = useState('daily');
  const [trendData, setTrendData] = useState([]);

  const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
  const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID');
  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper function untuk mendapatkan grouped dan sorted items (digunakan di header dan body)
  const getGroupedAndSortedItems = () => {
    const validItems = (historyData.products || []).filter(
      item => item && (item.type === 'product' || item.type === 'variant') && item.product_id
    );

    const grouped = validItems.reduce((acc, item) => {
      const key = String(item.product_id);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    // Sort items dalam setiap group: variant dulu
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        if (a.type === 'variant' && b.type === 'product') return -1;
        if (a.type === 'product' && b.type === 'variant') return 1;
        if (a.type === 'variant' && b.type === 'variant') {
          return (a.variant_id || 0) - (b.variant_id || 0);
        }
        return 0;
      });
    });

    // Sort: produk dengan variant dulu, lalu produk tanpa variant
    const sortedGroups = Object.entries(grouped).sort(([aId, aItems], [bId, bItems]) => {
      const aHasVariants = aItems.some(item => item.type === 'variant');
      const bHasVariants = bItems.some(item => item.type === 'variant');

      // Produk dengan variant dulu
      if (aHasVariants && !bHasVariants) return -1;
      if (!aHasVariants && bHasVariants) return 1;

      // Jika sama, sort by product_id
      return Number(aId) - Number(bId);
    });

    return sortedGroups;
  };

  const fetchSales = async (page = 1) => {
    setError(null);
    setLoading((prev) => ({ ...prev, sales: true }));
    try {
      const { data } = await api.get('/reports/sales-detail', {
        params: {
          from: salesFilters.from || undefined,
          to: salesFilters.to || undefined,
          status: salesFilters.status || undefined,
          channel: salesFilters.channel || undefined,
          search: salesFilters.search || undefined,
          per_page: PAGE_SIZE,
          page,
        },
      });
      setSalesData({
        rows: data.data?.data ?? data.data ?? [],
        meta: data.data?.meta ?? data.meta ?? null,
      });
    } catch (err) {
      setError(err.message || 'Gagal memuat laporan penjualan');
    } finally {
      setLoading((prev) => ({ ...prev, sales: false }));
    }
  };

  useEffect(() => {
    fetchSales(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesFilters.from, salesFilters.to, salesFilters.status, salesFilters.channel, salesFilters.search]);

  const fetchTrend = async () => {
    setError(null);
    setLoading((prev) => ({ ...prev, trend: true }));
    try {
      const { data } = await api.get('/reports/sales-trend', {
        params: {
          from: salesFilters.from || undefined,
          to: salesFilters.to || undefined,
          interval: trendInterval,
          status: salesFilters.status || undefined,
          channel: salesFilters.channel || undefined,
        },
      });
      setTrendData(data.data ?? data ?? []);
    } catch (err) {
      setError(err.message || 'Gagal memuat grafik penjualan');
    } finally {
      setLoading((prev) => ({ ...prev, trend: false }));
    }
  };

  useEffect(() => {
    fetchTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesFilters.from, salesFilters.to, salesFilters.status, salesFilters.channel, trendInterval]);

  const fetchHistory = async () => {
    setError(null);
    setLoading((prev) => ({ ...prev, history: true }));
    try {
      const { data } = await api.get('/reports/stock-history', {
        params: {
          start_date: historyFilters.from || undefined,
          end_date: historyFilters.to || undefined,
          interval: historyFilters.interval || undefined,
        },
      });
      const historyData = data.data ?? data ?? { products: [], segments: [] };
      setHistoryData(historyData);
    } catch (err) {
      setError(err.message || 'Gagal memuat riwayat stok');
    } finally {
      setLoading((prev) => ({ ...prev, history: false }));
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyFilters.from, historyFilters.to, historyFilters.interval]);

  const renderPagination = (meta, onChange, disabled) => {
    if (!meta) return null;
    return (
      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>
          Halaman {meta.current_page} dari {meta.last_page}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-2 rounded border text-slate-600 disabled:opacity-40"
            disabled={disabled || meta.current_page === 1}
            onClick={() => onChange(meta.current_page - 1)}
          >
            Sebelumnya
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded border text-slate-600 disabled:opacity-40"
            disabled={disabled || meta.current_page === meta.last_page}
            onClick={() => onChange(meta.current_page + 1)}
          >
            Berikutnya
          </button>
        </div>
      </div>
    );
  };

  const handleHistoryExport = async () => {
    try {
      setLoading((prev) => ({ ...prev, history: true }));
      const response = await api.get('/reports/export/stock-history', {
        params: {
          start_date: historyFilters.from || undefined,
          end_date: historyFilters.to || undefined,
          interval: historyFilters.interval || undefined,
        },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock-history-${historyFilters.from || 'all'}-${historyFilters.to || 'now'}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Gagal mengunduh CSV riwayat stok');
    } finally {
      setLoading((prev) => ({ ...prev, history: false }));
    }
  };

  const renderTrendChart = () => {
    if (loading.trend) {
      return <p className="text-sm text-slate-500">Memuat grafik penjualan...</p>;
    }

    if (!trendData.length) {
      return <p className="text-sm text-slate-500">Belum ada data penjualan pada periode ini.</p>;
    }

    const chartData = trendData.map((item) => ({
      label: item.label,
      revenue: Number(item.revenue) || 0,
      orders: Number(item.orders_count) || 0,
    }));

    const chartConfig = {
      revenue: {
        label: 'Omzet',
        color: '#D2001A',
      },
      orders: {
        label: 'Jumlah Pesanan',
        color: '#093FB4',
      },
    };

    return (
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: '#64748b', fontSize: 12 }}
            interval={0}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <ChartTooltipContent
                  active={active}
                  payload={payload}
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return [formatCurrency(value), 'Omzet'];
                    }
                    return [formatNumber(value) + ' pesanan', 'Jumlah Pesanan'];
                  }}
                />
              );
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            fill="#D2001A"
            radius={[8, 8, 0, 0]}
            name="revenue"
          />
        </BarChart>
      </ChartContainer>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">Laporan Penjualan & Stok</h1>
        <p className="text-sm text-slate-500">
          Fokus pada detail penjualan dan riwayat stok (snapshot per tanggal). Posisi stok real-time bisa dilihat di menu
          Kelola Produk.
        </p>
      </div>

      {error && <div className="p-3 rounded bg-red-50 text-sm text-red-700">{error}</div>}

      {/* Sales Trend */}
      <section className="card space-y-4">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">Grafik Tren Penjualan</p>
            <p className="text-sm text-slate-500">
              Monitor omzet dan jumlah pesanan secara cepat berdasarkan rentang tanggal yang sama seperti tabel detail.
            </p>
          </div>
          <div className="flex gap-3">
            <div>
              <label className="text-xs text-slate-500">Interval</label>
              <select
                className="input-field"
                value={trendInterval}
                onChange={(e) => setTrendInterval(e.target.value)}
              >
                {TREND_INTERVAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>
        {renderTrendChart()}
      </section>

      {/* Sales Detail Report */}
      <section className="card space-y-4">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">Laporan Penjualan Detail</p>
            <p className="text-sm text-slate-500">Tampilkan nama customer, tanggal, produk yang dibeli dan kode produknya.</p>
          </div>
          <div className="grid gap-3 w-full sm:grid-cols-2 lg:grid-cols-4 lg:w-auto">
            <div>
              <label className="text-xs text-slate-500">Dari</label>
              <input
                type="date"
                className="input-field"
                value={salesFilters.from}
                onChange={(e) => setSalesFilters((prev) => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Sampai</label>
              <input
                type="date"
                className="input-field"
                value={salesFilters.to}
                onChange={(e) => setSalesFilters((prev) => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Status</label>
              <select
                className="input-field"
                value={salesFilters.status}
                onChange={(e) => setSalesFilters((prev) => ({ ...prev, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500">Channel</label>
              <select
                className="input-field"
                value={salesFilters.channel}
                onChange={(e) => setSalesFilters((prev) => ({ ...prev, channel: e.target.value }))}
              >
                {CHANNEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="input-field md:w-1/3"
            placeholder="Cari nama customer / order / kode external"
            value={salesFilters.search}
            onChange={(e) => setSalesFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
          <p className="text-xs text-slate-400">
            Menampilkan {salesData.meta?.from ?? salesData.rows.length} -{' '}
            {salesData.meta?.to ?? salesData.rows.length} dari {salesData.meta?.total ?? salesData.rows.length} pesanan
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="min-w-full text-sm" id="sales-report-table">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Tanggal</th>
                <th className="px-3 py-2 text-left">Order ID</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Channel</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Produk & Kode</th>
                <th className="px-3 py-2 text-left">Qty</th>
                <th className="px-3 py-2 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {loading.sales ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                    Memuat data penjualan...
                  </td>
                </tr>
              ) : salesData.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                    Tidak ada penjualan pada periode ini.
                  </td>
                </tr>
              ) : (
                salesData.rows.map((order) => (
                  <tr key={order.id} className="border-t border-slate-50 align-top">
                    <td className="px-3 py-3 text-slate-600">{formatDate(order.ordered_at)}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      {order.external_order_id || `#${order.id}`}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{order.customer_name || '-'}</p>
                      <p className="text-xs text-slate-500">Total items: {formatNumber(order.total_items)}</p>
                    </td>
                    <td className="px-3 py-3 capitalize">{order.channel || '-'}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={`${order.id}-${item.product_name}-${idx}`}>
                            <p className="font-semibold text-slate-900">
                              {item.product_name}{' '}
                              {item.product_sku && <span className="text-xs text-slate-500">({item.product_sku})</span>}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatNumber(item.qty)} pcs x {formatCurrency(item.unit_price)}
                            </p>
                            {item.codes?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.codes.map((code) => (
                                  <span
                                    key={code}
                                    className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs"
                                  >
                                    {code}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3">{formatNumber(order.total_items)} pcs</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{formatCurrency(order.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {renderPagination(salesData.meta, fetchSales, loading.sales)}
      </section>

      {/* Stock History Matrix */}
      <section className="card space-y-4">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">Riwayat Stok (Mirip Spreadsheet)</p>
            <p className="text-sm text-slate-500">
              Pilih periode dan interval untuk melihat stok setiap produk seperti format Excel yang biasa digunakan.
            </p>
          </div>
          <div className="grid gap-3 w-full sm:grid-cols-2 lg:grid-cols-4 lg:w-auto">
            <div>
              <label className="text-xs text-slate-500">Dari</label>
              <input
                type="date"
                className="input-field"
                value={historyFilters.from}
                onChange={(e) => setHistoryFilters((prev) => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Sampai</label>
              <input
                type="date"
                className="input-field"
                value={historyFilters.to}
                onChange={(e) => setHistoryFilters((prev) => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Interval</label>
              <select
                className="input-field"
                value={historyFilters.interval}
                onChange={(e) => setHistoryFilters((prev) => ({ ...prev, interval: e.target.value }))}
              >
                {HISTORY_INTERVAL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="btn-secondary self-end" onClick={handleHistoryExport}>
              Download CSV
            </button>
          </div>
        </header>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="min-w-full text-sm border-collapse">
            <thead className="bg-slate-50">
              {/* Header row pertama: Nama produk dengan merged cells (hanya untuk produk dengan variant) */}
              <tr>
                <th rowSpan={2} className="px-3 py-2 text-left border border-slate-200">Tanggal</th>
                {(() => {
                  const sortedGroups = getGroupedAndSortedItems();

                  return sortedGroups
                    .map(([productId, items]) => {
                      // Ambil item variant pertama untuk mendapatkan nama_produk
                      const firstVariant = items.find(item => item.type === 'variant');
                      const firstItem = firstVariant || items.find(item => item.type === 'product');

                      // Hitung colSpan: hanya variant yang akan ditampilkan di row 2
                      const variants = items.filter(item => item.type === 'variant');
                      const colSpan = variants.length;
                      const hasVariants = variants.length > 0;

                      // Jika produk tidak punya variant, render th dengan rowSpan=2
                      if (!hasVariants) {
                        return (
                          <th
                            key={`product-${productId}`}
                            rowSpan={2}
                            className="px-3 py-2 text-center border border-slate-200 bg-orange-50 font-semibold align-middle"
                          >
                            {firstItem.nama_produk}
                          </th>
                        );
                      }

                      return (
                        <th
                          key={`product-${productId}`}
                          colSpan={colSpan}
                          className="px-3 py-2 text-center border border-slate-200 bg-orange-50 font-semibold"
                        >
                          {firstItem.nama_produk}
                        </th>
                      );
                    })
                    .filter(Boolean);
                })()}
                <th colSpan={2} className="px-3 py-2 text-center border border-slate-200 bg-orange-50 font-semibold">
                  CATATAN
                </th>
                <th rowSpan={2} className="px-3 py-2 text-center border border-slate-200 bg-orange-50 font-semibold">
                  TOTAL STOCK
                </th>
              </tr>
              {/* Header row kedua: Variant names (untuk produk dengan variant) atau nama produk (untuk produk tanpa variant) */}
              <tr>
                {(() => {
                  const sortedGroups = getGroupedAndSortedItems();

                  return sortedGroups.flatMap(([, items]) => {
                    const hasVariants = items.some(item => item.type === 'variant');

                    // Jika punya variant, hanya tampilkan variant (jangan tampilkan product)
                    // Jika tidak punya variant, skip (karena sudah di-handle di row 1 dengan rowSpan=2)
                    if (!hasVariants) {
                      return [];
                    }

                    const itemsToShow = items.filter(item => item.type === 'variant').sort((a, b) => (a.variant_id || 0) - (b.variant_id || 0));

                    return itemsToShow.map((item) => (
                      <th
                        key={item.id}
                        className={`px-3 py-2 text-center border border-slate-200 ${hasVariants ? 'bg-slate-100' : 'bg-orange-50 font-semibold'
                          }`}
                      >
                        {item.type === 'variant' ? (
                          <>
                            {item.variant_tipe}
                            {item.sku && <span className="text-xs text-slate-500"> ({item.sku})</span>}
                          </>
                        ) : (
                          <>
                            {item.nama_produk}
                            {item.sku && <span className="text-xs text-slate-500"> ({item.sku})</span>}
                          </>
                        )}
                      </th>
                    ));
                  });
                })()}
                <th className="px-3 py-2 text-center border border-slate-200 bg-slate-100">Terjual</th>
                <th className="px-3 py-2 text-center border border-slate-200 bg-slate-100">Beli Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading.history ? (
                <tr>
                  <td colSpan={historyData.products.length + 5} className="px-3 py-4 text-center text-slate-500 border border-slate-200">
                    Memuat riwayat stok...
                  </td>
                </tr>
              ) : historyData.segments.length === 0 ? (
                <tr>
                  <td colSpan={historyData.products.length + 5} className="px-3 py-4 text-center text-slate-500 border border-slate-200">
                    Tidak ada data riwayat stok untuk periode ini.
                  </td>
                </tr>
              ) : (
                historyData.segments.map((segment) => {
                  // Gunakan helper function yang sama seperti header
                  const sortedGroups = getGroupedAndSortedItems();

                  // Flatten items dengan urutan yang sama seperti header
                  const itemsToShow = sortedGroups.flatMap(([, items]) => {
                    const hasVariants = items.some(item => item.type === 'variant');
                    return hasVariants
                      ? items.filter(item => item.type === 'variant').sort((a, b) => (a.variant_id || 0) - (b.variant_id || 0))
                      : items.filter(item => item.type === 'product');
                  });

                  return (
                    <tr key={segment.date} className="border-t border-slate-200">
                      <td className="px-3 py-2 text-slate-600 border border-slate-200">{formatDate(segment.date)}</td>
                      {itemsToShow.map((item) => (
                        <td key={`${segment.date}-${item.id}`} className="px-3 py-2 text-center border border-slate-200">
                          {formatNumber(segment.products?.[item.id] ?? 0)}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-slate-900 font-semibold text-center border border-slate-200">
                        {formatNumber(segment.notes?.sold ?? 0)}
                      </td>
                      <td className="px-3 py-2 text-slate-900 font-semibold text-center border border-slate-200">
                        {formatNumber(segment.notes?.restock ?? 0)}
                      </td>
                      <td className="px-3 py-2 text-slate-900 font-semibold text-center border border-slate-200">
                        {formatNumber(segment.notes?.total_stock ?? 0)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminReportsPage;


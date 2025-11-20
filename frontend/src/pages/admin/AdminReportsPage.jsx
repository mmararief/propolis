import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';

const KPI_CARDS = [
  { key: 'total_orders', label: 'Total Pesanan' },
  { key: 'completed_orders', label: 'Pesanan Selesai' },
  { key: 'pending_orders', label: 'Menunggu' },
  { key: 'gross_revenue', label: 'Omzet' },
];

const TABS = [
  { id: 'stock', label: 'Stok Produk' },
  { id: 'products', label: 'Penjualan Produk' },
  { id: 'channels', label: 'Performa Channel' },
];

const AdminReportsPage = () => {
  const [filters, setFilters] = useState({ from: '', to: '', interval: 'daily' });
  const [activeTab, setActiveTab] = useState('stock');
  const [error, setError] = useState(null);

  const [summaryData, setSummaryData] = useState(null);
  const [trend, setTrend] = useState([]);
  const [stock, setStock] = useState([]);
  const [productReport, setProductReport] = useState({ data: [], meta: null });
  const [channelReport, setChannelReport] = useState([]);

  const [productSearch, setProductSearch] = useState('');

  const [loading, setLoading] = useState({
    summary: false,
    trend: false,
    stock: false,
    products: false,
    channels: false,
  });

  const formatCurrency = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
  const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID');

  const commonParams = () => ({
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  const fetchSummary = async () => {
    setLoading((prev) => ({ ...prev, summary: true }));
    try {
      const { data } = await api.get('/reports/summary', { params: commonParams() });
      setSummaryData(data.data ?? data ?? null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  };

  const fetchTrend = async () => {
    setLoading((prev) => ({ ...prev, trend: true }));
    try {
      const { data } = await api.get('/reports/sales-trend', {
        params: { ...commonParams(), interval: filters.interval },
      });
      setTrend(data.data ?? data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, trend: false }));
    }
  };

  const fetchStock = async () => {
    setLoading((prev) => ({ ...prev, stock: true }));
    try {
      const { data } = await api.get('/reports/batch-stock', { params: commonParams() });
      setStock(data.data ?? data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, stock: false }));
    }
  };

  const fetchProductSales = async (page = 1) => {
    setLoading((prev) => ({ ...prev, products: true }));
    try {
      const { data } = await api.get('/reports/product-sales', {
        params: { ...commonParams(), search: productSearch || undefined, page },
      });
      setProductReport({
        data: data.data?.data ?? data.data ?? [],
        meta: data.data?.meta ?? data.meta ?? null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  const fetchChannelPerformance = async () => {
    setLoading((prev) => ({ ...prev, channels: true }));
    try {
      const { data } = await api.get('/reports/channel-performance', { params: commonParams() });
      setChannelReport(data.data ?? data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading((prev) => ({ ...prev, channels: false }));
    }
  };

  const refreshAll = () => {
    setError(null);
    fetchSummary();
    fetchTrend();
    fetchStock();
    fetchProductSales();
    fetchChannelPerformance();
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.from, filters.to, filters.interval]);

  useEffect(() => {
    fetchProductSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearch]);

  const groupedStock = useMemo(() => {
    return stock
      .map((row) => ({
        productName: row.nama_produk,
        sku: row.sku,
        ready: row.qty_remaining ?? row.stok_available ?? 0,
        reserved: row.reserved_qty ?? row.stok_reserved ?? 0,
        total: row.qty_initial ?? row.stok ?? (row.qty_remaining ?? 0),
      }))
      .sort((a, b) => (b.ready ?? 0) - (a.ready ?? 0));
  }, [stock]);

  const renderTrend = () => {
    if (loading.trend) return <p className="text-sm text-slate-500">Memuat grafik...</p>;
    if (!trend.length) return <p className="text-sm text-slate-500">Belum ada data tren.</p>;

    const maxRevenue = Math.max(...trend.map((item) => Number(item.revenue) || 0)) || 1;

    return (
      <div className="flex items-end gap-3 h-48">
        {trend.map((point) => {
          const barHeight = ((Number(point.revenue) || 0) / maxRevenue) * 100;
          return (
            <div key={point.label} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-brand-red to-[#ff707e]"
                style={{ height: `${barHeight}%` }}
              />
              <p className="text-xs text-slate-500 mt-2 text-center">{point.label}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const handleExport = () => {
    const params = new URLSearchParams({
      from: filters.from || '',
      to: filters.to || '',
      search: productSearch || '',
    });
    const base = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';
    window.open(`${base}/reports/export/product-sales?${params.toString()}`, '_blank');
  };

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

  const printTable = (elementId, title) => {
    const node = document.getElementById(elementId);
    if (!node) return;
    const popup = window.open('', '_blank', 'width=900,height=600');
    popup.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
            th { background: #f3f4f6; text-transform: uppercase; letter-spacing: 0.5px; }
            h1 { margin-bottom: 0; font-size: 18px; }
            p { margin-top: 4px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Periode: ${filters.from || 'Semua'} - ${filters.to || 'Sekarang'}</p>
          ${node.outerHTML}
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const summary = summaryData?.summary ?? {};
  const topProducts = summaryData?.top_products ?? [];
  const lowStocks = summaryData?.low_stock_batches ?? [];

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Laporan & Analitik</h1>
            <p className="text-sm text-slate-500">Pantau KPI penjualan, channel, dan kesehatan stok.</p>
          </div>
          <div className="grid gap-3 w-full sm:grid-cols-2 lg:grid-cols-4 lg:w-auto">
            <div>
              <label className="text-xs text-slate-500">Dari</label>
              <input
                className="input-field"
                type="date"
                value={filters.from}
                onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Sampai</label>
              <input
                className="input-field"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500">Interval Tren</label>
              <select
                className="input-field"
                value={filters.interval}
                onChange={(e) => setFilters((prev) => ({ ...prev, interval: e.target.value }))}
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
              </select>
            </div>
            <button type="button" className="btn-primary self-end" onClick={refreshAll}>
              Refresh
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ key, label }) => (
          <div key={key} className="card">
            <p className="text-xs uppercase text-slate-500">{label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {key.includes('revenue') ? formatCurrency(summary[key]) : formatNumber(summary[key])}
            </p>
            {loading.summary && <p className="text-xs text-slate-400 mt-1">Memuat...</p>}
          </div>
        ))}
      </div>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-900">
            Tren Penjualan ({filters.interval === 'daily' ? 'Harian' : 'Mingguan'})
          </p>
          <p className="text-xs text-slate-500">Total titik: {trend.length}</p>
        </div>
        {renderTrend()}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-900">Top Produk</p>
            <span className="text-xs text-slate-500">Top 5</span>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data penjualan.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item) => (
                <div key={item.product_id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{item.nama_produk}</p>
                    <p className="text-xs text-slate-500">SKU {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatNumber(item.qty_sold)} pcs</p>
                    <p className="text-xs text-slate-500">{formatCurrency(item.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-900">Stok Kritis</p>
            <span className="text-xs text-slate-500">Produk prioritas</span>
          </div>
          {lowStocks.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada produk dengan stok kritis.</p>
          ) : (
            <div className="space-y-3">
              {lowStocks.map((product) => (
                <div key={`${product.product_id}-${product.sku || 'sku'}`} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{product.nama_produk}</p>
                    <p className="text-xs text-slate-500">SKU {product.sku || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{formatNumber(product.available)} pcs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-3 border-b border-slate-100 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold ${
                activeTab === tab.id ? 'text-brand-red border-b-2 border-brand-red' : 'text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'stock' && (
          <div className="space-y-4">
            {loading.stock ? (
              <p className="text-sm text-slate-500">Memuat data stok...</p>
            ) : groupedStock.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada data stok untuk periode ini.</p>
            ) : (
              <div className="grid gap-4">
                {groupedStock.map((product, idx) => (
                  <div
                    key={`${product.productName}-${product.sku || idx}`}
                    className="rounded-xl border border-slate-100 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{product.productName || '-'}</p>
                      {product.sku && <p className="text-xs text-slate-500">SKU {product.sku}</p>}
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-slate-500">Ready</p>
                        <p className="text-lg font-bold text-slate-900">{formatNumber(product.ready)} pcs</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Reserved</p>
                        <p className="text-lg font-bold text-orange-600">{formatNumber(product.reserved)} pcs</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Total</p>
                        <p className="text-lg font-bold text-slate-900">{formatNumber(product.total)} pcs</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <input
                className="input-field md:w-1/3"
                placeholder="Cari produk atau SKU"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" className="text-sm font-semibold text-brand-red" onClick={handleExport}>
                  Export CSV
                </button>
                <button
                  type="button"
                  className="text-sm font-semibold text-brand-red/70"
                  onClick={() => printTable('product-report-table', 'Laporan Penjualan Produk')}
                >
                  Export PDF
                </button>
              </div>
            </div>
            {loading.products ? (
              <p className="text-sm text-slate-500">Memuat data produk...</p>
            ) : productReport.data.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada penjualan dalam periode ini.</p>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table id="product-report-table" className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Produk</th>
                        <th className="px-3 py-2 text-left">SKU</th>
                        <th className="px-3 py-2 text-left">Qty Terjual</th>
                        <th className="px-3 py-2 text-left">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productReport.data.map((row) => (
                        <tr key={row.product_id} className="border-t border-slate-50">
                          <td className="px-3 py-2 font-semibold text-slate-900">{row.nama_produk}</td>
                          <td className="px-3 py-2 text-slate-500">{row.sku}</td>
                          <td className="px-3 py-2">{formatNumber(row.qty_sold)}</td>
                          <td className="px-3 py-2">{formatCurrency(row.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination(productReport.meta, fetchProductSales, loading.products)}
              </>
            )}
          </div>
        )}

        {activeTab === 'channels' && (
          <div className="space-y-4">
            {loading.channels ? (
              <p className="text-sm text-slate-500">Memuat performa channel...</p>
            ) : channelReport.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada data channel.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Channel</th>
                      <th className="px-3 py-2 text-left">Jumlah Pesanan</th>
                      <th className="px-3 py-2 text-left">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelReport.map((row, idx) => (
                      <tr key={`${row.channel || 'unknown'}-${idx}`} className="border-t border-slate-50">
                        <td className="px-3 py-2 font-semibold text-slate-900">{row.channel || 'online'}</td>
                        <td className="px-3 py-2">{formatNumber(row.orders_count)}</td>
                        <td className="px-3 py-2">{formatCurrency(row.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;


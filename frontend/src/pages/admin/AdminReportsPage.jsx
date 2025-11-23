import { useEffect, useState, useRef } from 'react';
import api from '../../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import * as XLSX from 'xlsx';

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

// Download Button Component dengan Dropdown
const DownloadButton = ({ onExportCSV, onExportExcel, isLoading, label = 'Unduh Laporan' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#D2001A] text-white font-semibold rounded-lg shadow hover:bg-[#b40016] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>{label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              onExportCSV();
              setIsOpen(false);
            }}
            disabled={isLoading}
            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <p className="font-semibold text-slate-900">Download CSV</p>
              <p className="text-xs text-slate-500">Format file .csv</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              onExportExcel();
              setIsOpen(false);
            }}
            disabled={isLoading}
            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border-t border-slate-100"
          >
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <p className="font-semibold text-slate-900">Download Excel</p>
              <p className="text-xs text-slate-500">Format file .xlsx</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

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

  // Export functions untuk Sales Reports
  const exportSalesReportCSV = async () => {
    try {
      setLoading((prev) => ({ ...prev, sales: true }));
      // Fetch semua data tanpa pagination
      const { data } = await api.get('/reports/sales-detail', {
        params: {
          from: salesFilters.from || undefined,
          to: salesFilters.to || undefined,
          status: salesFilters.status || undefined,
          channel: salesFilters.channel || undefined,
          search: salesFilters.search || undefined,
          per_page: 10000, // Ambil semua data
          page: 1,
        },
      });
      const orders = data.data?.data ?? data.data ?? [];

      // Prepare CSV data
      const csvRows = [
        ['Tanggal', 'Order ID', 'Customer', 'Channel', 'Status', 'Produk', 'SKU', 'Qty', 'Harga Satuan', 'Total Item', 'Kode Produk', 'Total Order'],
      ];

      orders.forEach((order) => {
        if (order.items && order.items.length > 0) {
          order.items.forEach((item, idx) => {
            csvRows.push([
              formatDate(order.ordered_at),
              order.external_order_id || `#${order.id}`,
              order.customer_name || '-',
              order.channel || '-',
              order.status || '-',
              item.product_name || '-',
              item.product_sku || '-',
              item.qty || 0,
              item.unit_price || 0,
              order.total_items || 0,
              item.codes?.join(', ') || '-',
              idx === 0 ? (order.total || 0) : '', // Total hanya di row pertama
            ]);
          });
        } else {
          csvRows.push([
            formatDate(order.ordered_at),
            order.external_order_id || `#${order.id}`,
            order.customer_name || '-',
            order.channel || '-',
            order.status || '-',
            '-',
            '-',
            '-',
            '-',
            order.total_items || 0,
            '-',
            order.total || 0,
          ]);
        }
      });

      // Convert to CSV string
      const csvContent = csvRows.map(row => row.map(cell => {
        const str = String(cell || '');
        return `"${str.replace(/"/g, '""')}"`;
      }).join(',')).join('\n');

      // Download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = `${salesFilters.from || 'all'}_${salesFilters.to || 'now'}`;
      link.download = `laporan-penjualan_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'Gagal mengunduh CSV laporan penjualan');
    } finally {
      setLoading((prev) => ({ ...prev, sales: false }));
    }
  };

  const exportSalesReportExcel = async () => {
    try {
      setLoading((prev) => ({ ...prev, sales: true }));
      // Fetch semua data tanpa pagination
      const { data } = await api.get('/reports/sales-detail', {
        params: {
          from: salesFilters.from || undefined,
          to: salesFilters.to || undefined,
          status: salesFilters.status || undefined,
          channel: salesFilters.channel || undefined,
          search: salesFilters.search || undefined,
          per_page: 10000, // Ambil semua data
          page: 1,
        },
      });
      const orders = data.data?.data ?? data.data ?? [];

      // Prepare Excel data
      const excelData = [
        ['Tanggal', 'Order ID', 'Customer', 'Channel', 'Status', 'Produk', 'SKU', 'Qty', 'Harga Satuan', 'Total Item', 'Kode Produk', 'Total Order'],
      ];

      orders.forEach((order) => {
        if (order.items && order.items.length > 0) {
          order.items.forEach((item, idx) => {
            excelData.push([
              formatDate(order.ordered_at),
              order.external_order_id || `#${order.id}`,
              order.customer_name || '-',
              order.channel || '-',
              order.status || '-',
              item.product_name || '-',
              item.product_sku || '-',
              item.qty || 0,
              item.unit_price || 0,
              order.total_items || 0,
              item.codes?.join(', ') || '-',
              idx === 0 ? (order.total || 0) : '', // Total hanya di row pertama
            ]);
          });
        } else {
          excelData.push([
            formatDate(order.ordered_at),
            order.external_order_id || `#${order.id}`,
            order.customer_name || '-',
            order.channel || '-',
            order.status || '-',
            '-',
            '-',
            '-',
            '-',
            order.total_items || 0,
            '-',
            order.total || 0,
          ]);
        }
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan');

      // Set column widths
      ws['!cols'] = [
        { wch: 12 }, // Tanggal
        { wch: 12 }, // Order ID
        { wch: 20 }, // Customer
        { wch: 10 }, // Channel
        { wch: 15 }, // Status
        { wch: 30 }, // Produk
        { wch: 15 }, // SKU
        { wch: 8 },  // Qty
        { wch: 15 }, // Harga Satuan
        { wch: 10 }, // Total Item
        { wch: 20 }, // Kode Produk
        { wch: 15 }, // Total Order
      ];

      // Download
      const dateStr = `${salesFilters.from || 'all'}_${salesFilters.to || 'now'}`;
      XLSX.writeFile(wb, `laporan-penjualan_${dateStr}.xlsx`);
    } catch (err) {
      setError(err.message || 'Gagal mengunduh Excel laporan penjualan');
    } finally {
      setLoading((prev) => ({ ...prev, sales: false }));
    }
  };

  // Export functions untuk Stock History
  const exportStockHistoryCSV = async () => {
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
      const dateStr = `${historyFilters.from || 'all'}_${historyFilters.to || 'now'}`;
      link.download = `riwayat-stok_${dateStr}.csv`;
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

  const exportStockHistoryExcel = async () => {
    try {
      setLoading((prev) => ({ ...prev, history: true }));
      const { data } = await api.get('/reports/stock-history', {
        params: {
          start_date: historyFilters.from || undefined,
          end_date: historyFilters.to || undefined,
          interval: historyFilters.interval || undefined,
        },
      });
      const historyData = data.data ?? data ?? { products: [], segments: [] };
      
      // Helper function untuk grouping dan sorting dari data yang baru diambil
      const getGroupedAndSortedFromData = (products) => {
        const validItems = (products || []).filter(
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
      
      // Prepare Excel data dengan format matrix
      const sortedGroups = getGroupedAndSortedFromData(historyData.products);
      const excelData = [];

      // Header Row 1
      const header1 = ['Tanggal'];
      sortedGroups.forEach(([productId, items]) => {
        const firstVariant = items.find(item => item.type === 'variant');
        const firstItem = firstVariant || items.find(item => item.type === 'product');
        const variants = items.filter(item => item.type === 'variant');
        const hasVariants = variants.length > 0;
        
        if (!hasVariants) {
          header1.push(firstItem.nama_produk);
        } else {
          header1.push(firstItem.nama_produk);
          for (let i = 1; i < variants.length; i++) {
            header1.push('');
          }
        }
      });
      header1.push('CATATAN');
      header1.push('');
      header1.push('TOTAL STOCK');
      excelData.push(header1);

      // Header Row 2
      const header2 = [''];
      sortedGroups.forEach(([, items]) => {
        const hasVariants = items.some(item => item.type === 'variant');
        if (!hasVariants) {
          header2.push('');
        } else {
          const itemsToShow = items.filter(item => item.type === 'variant').sort((a, b) => (a.variant_id || 0) - (b.variant_id || 0));
          itemsToShow.forEach((item) => {
            const label = item.variant_tipe + (item.sku ? ` (${item.sku})` : '');
            header2.push(label);
          });
        }
      });
      header2.push('Terjual');
      header2.push('Beli Stock');
      header2.push('');
      excelData.push(header2);

      // Data rows
      historyData.segments.forEach((segment) => {
        const row = [formatDate(segment.date)];
        const itemsToShow = sortedGroups.flatMap(([, items]) => {
          const hasVariants = items.some(item => item.type === 'variant');
          return hasVariants
            ? items.filter(item => item.type === 'variant').sort((a, b) => (a.variant_id || 0) - (b.variant_id || 0))
            : items.filter(item => item.type === 'product');
        });

        itemsToShow.forEach((item) => {
          row.push(segment.products?.[item.id] ?? 0);
        });
        row.push(segment.notes?.sold ?? 0);
        row.push(segment.notes?.restock ?? 0);
        row.push(segment.notes?.total_stock ?? 0);
        excelData.push(row);
      });

      // Create workbook and worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Riwayat Stok');

      // Merge cells untuk header row 1 (product names)
      let colIndex = 1; // Start after Tanggal column
      sortedGroups.forEach(([, items]) => {
        const variants = items.filter(item => item.type === 'variant');
        const hasVariants = variants.length > 0;
        
        if (hasVariants && variants.length > 1) {
          ws[`!merges`] = ws[`!merges`] || [];
          ws[`!merges`].push({
            s: { r: 0, c: colIndex },
            e: { r: 0, c: colIndex + variants.length - 1 }
          });
        }
        colIndex += hasVariants ? variants.length : 1;
      });

      // Merge cells untuk CATATAN
      const catatanStartCol = colIndex;
      ws[`!merges`] = ws[`!merges`] || [];
      ws[`!merges`].push({
        s: { r: 0, c: catatanStartCol },
        e: { r: 0, c: catatanStartCol + 1 }
      });

      // Download
      const dateStr = `${historyFilters.from || 'all'}_${historyFilters.to || 'now'}`;
      XLSX.writeFile(wb, `riwayat-stok_${dateStr}.xlsx`);
    } catch (err) {
      setError(err.message || 'Gagal mengunduh Excel riwayat stok');
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
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
            <DownloadButton
              onExportCSV={exportSalesReportCSV}
              onExportExcel={exportSalesReportExcel}
              isLoading={loading.sales}
              label="Unduh Laporan"
            />
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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="grid gap-3 w-full sm:grid-cols-2 lg:grid-cols-3 lg:w-auto">
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
            </div>
            <DownloadButton
              onExportCSV={exportStockHistoryCSV}
              onExportExcel={exportStockHistoryExcel}
              isLoading={loading.history}
              label="Unduh Laporan"
            />
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


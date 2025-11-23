import { useEffect, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Package, ShoppingCart, Clock, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user } = useAuth();


  const LOW_STOCK_THRESHOLD = 10;
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockLoading, setLowStockLoading] = useState(false);
  const [lowStockError, setLowStockError] = useState(null);

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStats(), fetchLowStockProducts()]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      const data = response.data.data;

      setStats({
        totalProducts: data.total_products,
        totalOrders: data.total_orders,
        totalUsers: data.total_users,
        pendingOrders: data.pending_orders,
        todayOrders: data.today_orders,
        todayRevenue: data.today_revenue,
      });
      setRecentActivities(data.recent_activities ?? []);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLowStockProducts = async ({ withLoader = false } = {}) => {
    try {
      setLowStockError(null);
      if (withLoader) {
        setLowStockLoading(true);
      }
      const response = await api.get('/admin/low-stock-products', {
        params: {
          threshold: LOW_STOCK_THRESHOLD,
          limit: 8,
        },
      });
      setLowStockProducts(response.data.data ?? []);
    } catch (error) {
      console.error('Failed to fetch low stock products:', error);
      setLowStockError(error.message ?? 'Gagal memuat data stok rendah.');
    } finally {
      if (withLoader) {
        setLowStockLoading(false);
      }
    }
  };

  const handleRefreshLowStock = () => {
    fetchLowStockProducts({ withLoader: true });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Produk',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Pesanan',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Pesanan Pending',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      title: 'Pesanan Hari Ini',
      value: stats.todayOrders,
      icon: Calendar,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pendapatan Hari Ini',
      value: formatCurrency(stats.todayRevenue),
      icon: DollarSign,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Produk Stok Rendah',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Admin</h1>
          <p className="text-slate-600">
            Memuat data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Aksi Cepat */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Admin</h1>
          <p className="text-slate-600">
            Selamat Datang, {user?.name || 'Admin'}! Berikut adalah ringkasan aktivitas toko Anda hari ini.
          </p>
        </div>

      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex items-start justify-between"
            >
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <span className="mr-2">⚠️</span>
                Notifikasi Stok Rendah
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Menampilkan produk dengan stok tersedia ≤ {LOW_STOCK_THRESHOLD} unit.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefreshLowStock}
              disabled={lowStockLoading}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {lowStockLoading ? 'Menyegarkan...' : 'Segarkan Data'}
            </button>
          </div>

          {lowStockError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {lowStockError}
            </div>
          )}

          {!lowStockError && lowStockProducts.length === 0 && (
            <p className="text-sm text-slate-600">Semua stok berada di atas batas aman.</p>
          )}

          {!lowStockError && lowStockProducts.length > 0 && (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{product.nama_produk}</p>
                    <p className="text-sm text-slate-600">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{product.stok_available} unit</p>
                    <p className="text-sm text-slate-600">tersedia</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Aktivitas Terkini</h2>
          {recentActivities.length === 0 ? (
            <p className="text-slate-600">Tidak ada aktivitas terkini.</p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600 mt-1">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-1">
                      {formatCurrency(activity.amount)} • <span className="capitalize">{activity.status.replace('_', ' ')}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

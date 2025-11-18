import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch products
      const productsRes = await api.get('/products');
      const products = productsRes.data.data?.data ?? productsRes.data.data ?? [];
      
      // Fetch orders
      const ordersRes = await api.get('/admin/orders');
      const orders = ordersRes.data.data?.data ?? ordersRes.data.data ?? [];
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayOrdersList = orders.filter(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        return orderDate === today;
      });
      
      const pendingOrdersList = orders.filter(order => 
        order.status === 'menunggu_konfirmasi' || order.status === 'belum_dibayar'
      );
      
      const todayRevenue = todayOrdersList.reduce((sum, order) => {
        return sum + (parseFloat(order.total_harga) || 0);
      }, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalUsers: 0, // Will need API endpoint for this
        pendingOrders: pendingOrdersList.length,
        todayOrders: todayOrdersList.length,
        todayRevenue: todayRevenue,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
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
      color: 'bg-[#D2001A]',
    },
    {
      title: 'Total Pesanan',
      value: stats.totalOrders,
      color: 'bg-[#093FB4]',
    },
    {
      title: 'Pesanan Pending',
      value: stats.pendingOrders,
      color: 'bg-orange-500',
    },
    {
      title: 'Pesanan Hari Ini',
      value: stats.todayOrders,
      color: 'bg-green-500',
    },
    {
      title: 'Pendapatan Hari Ini',
      value: formatCurrency(stats.todayRevenue),
      color: 'bg-purple-500',
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Admin</h1>
        <p className="text-slate-600">
          Selamat Datang, {user?.name || 'Admin'}! Berikut adalah ringkasan aktivitas toko Anda hari ini.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className={`${card.color} px-6 py-4`}>
              <h3 className="text-white text-sm font-medium">{card.title}</h3>
            </div>
            <div className="px-6 py-4 bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Content Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Aktivitas Terkini</h2>
        <p className="text-slate-600">Tidak ada aktivitas terkini.</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

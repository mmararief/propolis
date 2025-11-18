import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '⚡' },
    { path: '/admin/categories', label: 'Kelola Kategori', icon: '📁' },
    { path: '/admin/products', label: 'Kelola Produk', icon: '🏷️' },
    { path: '/admin/orders', label: 'Kelola Pesanan', icon: '🛒' },
    { path: '/admin/users', label: 'Kelola Akun Users', icon: '👥' },
    { path: '/admin/reports', label: 'Laporan', icon: '📄' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-[#D2001A] min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-red-800">
        <h1 className="text-white font-bold text-xl mb-1">BRITISH PROPOLIS</h1>
        <p className="text-white/80 text-xs">Distributor Resmi BRITISH PROPOLIS</p>
      </div>

      {/* Admin Panel Title */}
      <div className="px-6 py-4 border-b border-red-800">
        <h2 className="text-white font-bold text-sm uppercase">Admin Panel</h2>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-6 py-3 text-white hover:bg-red-800 transition-colors ${
                active ? 'bg-red-800' : ''
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-red-800">
        <button
          onClick={handleLogout}
          className="w-full bg-red-700 hover:bg-red-800 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <span>→</span>
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;


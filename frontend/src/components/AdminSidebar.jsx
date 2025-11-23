import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      id: 1,
      path: '/admin',
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      iconAlt: 'Dashboard gauge'
    },
    {
      id: 2,
      path: '/admin/categories',
      label: 'Kelola Kategori',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      iconAlt: 'Category'
    },
    {
      id: 3,
      path: '/admin/products',
      label: 'Kelola Produk',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      iconAlt: 'Product'
    },

    {
      id: 5,
      path: '/admin/orders',
      label: 'Kelola Pesanan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconAlt: 'Shopping cart'
    },
    {
      id: 6,
      path: '/admin/users',
      label: 'Kelola Akun Users',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      iconAlt: 'People'
    },
    {
      id: 7,
      path: '/admin/reports',
      label: 'Laporan',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      iconAlt: 'Business report'
    },
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
    <aside className="w-[280px] h-screen bg-gradient-to-b from-[#D2001A] to-[#6C000D] fixed left-0 top-0 flex flex-col z-50">
      {/* Header */}
      <header className="mt-8 px-4 w-full flex flex-col items-center">
        <h1
          className="font-normal text-white text-2xl text-center tracking-wide leading-tight whitespace-nowrap"
          style={{ fontFamily: "'Racing Sans One', Helvetica, sans-serif" }}
        >
          BRITISH PROPOLIS
        </h1>
        <p
          className="mt-1 font-normal text-white text-[10px] text-center tracking-wide leading-tight whitespace-nowrap"
          style={{ fontFamily: "'Poppins', Helvetica, sans-serif" }}
        >
          <span>Distributor Resmi </span>
          <span style={{ fontFamily: "'Racing Sans One', Helvetica, sans-serif" }}>
            DANTE PROPOLIS
          </span>
        </p>
      </header>

      {/* Admin Panel Title */}
      <div
        className="mt-8 w-full flex items-center justify-center font-bold text-white text-2xl text-center tracking-wide whitespace-nowrap"
        style={{ fontFamily: "'Poppins', Helvetica, sans-serif" }}
      >
        Admin Panel
      </div>

      {/* Separator Line */}
      <div className="mt-6 w-full h-px bg-white/30" />

      {/* Navigation Menu */}
      <nav
        className="mt-6 flex flex-col gap-2 px-4"
        style={{ fontFamily: "'Poppins', Helvetica, sans-serif" }}
      >
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${active ? 'bg-[#ff2c2c]' : 'bg-transparent hover:bg-[#ff5a5a]'
                }`}
              aria-current={active ? 'page' : undefined}
            >
              <div
                className="w-6 h-6 text-white flex items-center justify-center"
                aria-label={item.iconAlt}
              >
                {item.icon}
              </div>
              <span className="text-white font-semibold text-sm">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button di paling bawah sidebar */}
      <div className="mt-auto mb-8 flex justify-center px-4">
        <button
          onClick={handleLogout}
          className="w-full h-[45px] bg-[#d9d9d9] rounded-[50px] flex items-center justify-center gap-3 hover:bg-[#c9c9c9] transition-colors group"
        >
          <svg
            className="w-5 h-5 text-[#d2001a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span
            className="font-semibold text-[#d2001a] text-sm tracking-wide"
            style={{ fontFamily: "'Poppins', Helvetica, sans-serif" }}
          >
            Keluar
          </span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

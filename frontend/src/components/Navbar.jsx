import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Import images
import searchIcon from '../assets/images/search0.png';
import cartIcon from '../assets/images/shopping-cart0.png';
import profileIcon from '../assets/images/profile0.png';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full h-[70px] bg-white z-50 shadow-sm">
      <div className="relative w-full h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-16">
        <div className="flex items-center justify-between h-full py-2">
          {/* Brand */}
          <div className="flex flex-col gap-1 items-end">
            <div
              className="text-[28px] md:text-[32px] leading-none text-right"
              style={{ fontFamily: "'Racing Sans One', Helvetica, sans-serif" }}
            >
              <span style={{ color: '#093FB4' }}>BRITISH </span>
              <span style={{ color: '#D2001A' }}>PROPOLIS</span>
            </div>
            <div className="text-[9px] md:text-[11px] font-ui text-right">
              <span className="text-black">Distributor Resmi </span>
              <span
                style={{
                  fontFamily: "'Racing Sans One', Helvetica, sans-serif",
                  color: '#D2001A'
                }}
              >
                DANTE{' '}
              </span>
              <span
                style={{
                  fontFamily: "'Racing Sans One', Helvetica, sans-serif",
                  color: '#093FB4'
                }}
              >
                PROPOLIS
              </span>
            </div>
          </div>

          {/* Navigation Items - Desktop */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-5">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-ui font-bold text-[15px] xl:text-[16px] h-8 flex items-center hover:opacity-80 transition-opacity duration-200 ${isActive ? '' : 'text-black'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? '#D2001A' : '#000000',
              })}
            >
              Beranda
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `font-ui font-bold text-[15px] xl:text-[16px] h-8 flex items-center hover:opacity-80 transition-opacity duration-200 ${isActive ? '' : 'text-black'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? '#D2001A' : '#000000',
              })}
            >
              Tentang Kami
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `font-ui font-bold text-[15px] xl:text-[16px] h-8 flex items-center hover:opacity-80 transition-opacity duration-200 ${isActive ? '' : 'text-black'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? '#D2001A' : '#000000',
              })}
            >
              Produk
            </NavLink>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <img
                src={searchIcon}
                alt="Cari"
                className="w-10 h-10 object-cover"
              />
              <input
                type="text"
                placeholder="Cari Produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[150px] h-10 font-ui font-bold text-[20px] text-black outline-none bg-transparent placeholder:text-black"
              />
            </form>

            {/* Cart & Auth */}
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/cart" className="relative">
                  <img
                    src={cartIcon}
                    alt="Keranjang"
                    className="w-[40px] h-[40px] xl:w-[44px] xl:h-[44px] object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  />
                  {items.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      style={{ backgroundColor: '#D2001A' }}
                    >
                      {items.length}
                    </span>
                  )}
                </Link>
                <img
                  src={profileIcon}
                  alt="Profil"
                  className="w-[40px] h-[40px] xl:w-[44px] xl:h-[44px] object-cover cursor-pointer hover:opacity-80 transition-opacity duration-200"
                  onClick={() => navigate('/profile')}
                />
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="font-ui font-bold text-[16px] hover:underline"
                    style={{ color: '#D2001A' }}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={logout}
                  className="font-ui font-bold text-[16px] text-black hover:opacity-70"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="w-[75px] xl:w-[85px] h-7 xl:h-8 rounded-[50px] flex items-center justify-center font-ui font-bold text-[13px] xl:text-[15px] text-white hover:opacity-90 transition-opacity duration-200"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-[75px] xl:w-[85px] h-7 xl:h-8 rounded-[50px] flex items-center justify-center font-ui font-bold text-[13px] xl:text-[15px] text-white hover:opacity-90 transition-opacity duration-200"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  Daftar
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              type="button"
              className="text-black text-2xl"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-[70px] left-0 w-full bg-white shadow-md py-4 px-4 flex flex-col gap-4 border-t border-gray-100">
            {/* Search - Mobile */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
              <img
                src={searchIcon}
                alt="Cari"
                className="w-5 h-5 object-cover opacity-50"
              />
              <input
                type="text"
                placeholder="Cari Produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full font-ui text-[16px] text-black outline-none bg-transparent placeholder:text-gray-400"
              />
            </form>

            <div className="flex flex-col gap-2">
              <NavLink
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `font-ui font-bold text-[16px] py-2 border-b border-gray-50 ${isActive ? 'text-[#D2001A]' : 'text-black'
                  }`
                }
              >
                Beranda
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `font-ui font-bold text-[16px] py-2 border-b border-gray-50 ${isActive ? 'text-[#D2001A]' : 'text-black'
                  }`
                }
              >
                Tentang Kami
              </NavLink>
              <NavLink
                to="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `font-ui font-bold text-[16px] py-2 border-b border-gray-50 ${isActive ? 'text-[#D2001A]' : 'text-black'
                  }`
                }
              >
                Produk
              </NavLink>
            </div>

            {/* Auth Buttons - Mobile */}
            <div className="flex flex-col gap-3 mt-2">
              {user ? (
                <>
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 font-ui font-bold text-[16px] text-black py-2"
                  >
                    <img src={cartIcon} alt="Cart" className="w-6 h-6" />
                    Keranjang ({items.length})
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 font-ui font-bold text-[16px] text-black py-2"
                  >
                    <img src={profileIcon} alt="Profile" className="w-6 h-6" />
                    Profil Saya
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-ui font-bold text-[16px] text-[#D2001A] py-2"
                    >
                      Halaman Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="font-ui font-bold text-[16px] text-left text-red-600 py-2"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <div className="flex gap-3 mt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 h-10 rounded-full flex items-center justify-center font-ui font-bold text-white"
                    style={{ backgroundColor: '#D2001A' }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 h-10 rounded-full flex items-center justify-center font-ui font-bold text-white"
                    style={{ backgroundColor: '#D2001A' }}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

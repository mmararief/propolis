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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full h-[100px] bg-white z-50">
      <div className="relative w-full h-full max-w-[1600px] mx-auto px-8 xl:px-[150px]">
        <div className="flex items-center justify-between h-full">
          {/* Brand */}
          <div className="flex flex-col gap-1">
            <div className="font-brand text-[40px] leading-none">
              <span style={{ color: '#D2001A' }}>DANTE</span>
              <span className="ml-1.5" style={{ color: '#093FB4' }}>PROPOLIS</span>
            </div>
            <div className="text-[12px] font-ui ml-[100px]">
              <span className="text-black">Distributor Resmi </span>
              <span className="font-brand font-bold" style={{ color: '#093FB4' }}>BRITISH</span>
              <span className="font-brand font-bold ml-0.5" style={{ color: '#D2001A' }}>PROPOLIS</span>
            </div>
          </div>

          {/* Navigation Items - Desktop */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-ui font-bold text-[20px] h-10 flex items-center hover:opacity-80 ${
                  isActive ? '' : 'text-black'
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
                `font-ui font-bold text-[20px] h-10 flex items-center hover:opacity-80 ${
                  isActive ? '' : 'text-black'
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
                `font-ui font-bold text-[20px] h-10 flex items-center hover:opacity-80 ${
                  isActive ? '' : 'text-black'
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
                    className="w-[50px] h-[50px] object-cover cursor-pointer hover:opacity-80"
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
                  className="w-[50px] h-[50px] object-cover cursor-pointer hover:opacity-80"
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
                  className="w-[100px] h-10 rounded-[50px] flex items-center justify-center font-ui font-bold text-[20px] text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#D2001A' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-[100px] h-10 rounded-[50px] flex items-center justify-center font-ui font-bold text-[20px] text-white hover:opacity-90 transition-opacity"
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
              onClick={() => {
                // Mobile menu toggle logic can be added here
              }}
            >
              ☰
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

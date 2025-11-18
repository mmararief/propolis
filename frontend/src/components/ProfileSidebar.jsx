import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileSidebar = ({ activeTab = 'profile' }) => {
  const { user, logout } = useAuth();

  return (
    <div className="lg:w-80 shrink-0">
      <div className="bg-white rounded-lg shadow-md p-6 sticky top-[120px]">
        {/* User Profile */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: '#D2001A' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <p className="font-ui font-semibold text-lg text-gray-900">
            {user?.email || user?.username || user?.nama_lengkap || 'User'}
          </p>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {/* Akun Saya */}
          {activeTab === 'profile' ? (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-ui font-semibold text-white"
              style={{ backgroundColor: '#D2001A' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Akun Saya
            </div>
          ) : (
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-ui font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                style={{ color: '#D2001A' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Akun Saya
            </Link>
          )}

          {/* Pesanan Saya */}
          {activeTab === 'orders' ? (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-ui font-semibold text-white"
              style={{ backgroundColor: '#D2001A' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Pesanan Saya
            </div>
          ) : (
            <Link
              to="/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-ui font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                style={{ color: '#D2001A' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Pesanan Saya
            </Link>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-ui font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#D2001A' }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Keluar
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;


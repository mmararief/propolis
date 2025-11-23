import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-white w-full min-w-[1920px] relative">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white ml-[400px] min-h-screen">
        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto w-full pt-6 px-6 pb-6 bg-white">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

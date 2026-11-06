import { Suspense, useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { getAdminToken, setAdminToken, ADMIN_AUTH_EXPIRED } from '../utils/adminFetch';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(() => !!getAdminToken());

  // adminFetch báo khi server trả 401 (token hết hạn) → về trang đăng nhập
  useEffect(() => {
    const onExpired = () => setLoggedIn(false);
    window.addEventListener(ADMIN_AUTH_EXPIRED, onExpired);
    return () => window.removeEventListener(ADMIN_AUTH_EXPIRED, onExpired);
  }, []);

  const logout = () => {
    setAdminToken('');
    navigate('/admin/login', { replace: true });
  };

  // Chưa đăng nhập thì chuyển hướng trước khi trang con kịp gọi API
  if (!loggedIn) return <Navigate to="/admin/login" replace />;

  return (
    <div className="flex h-screen flex-col bg-slate-100 text-slate-800 lg:flex-row">
      {/* Cột Sidebar Trái */}
      <aside className="flex w-full shrink-0 flex-col bg-slate-900 text-white lg:w-64">
        <div className="border-b border-slate-800 p-3 sm:p-4">
          <h2 className="text-lg font-black text-zoo-400 sm:text-xl">Zoo Admin</h2>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-2 lg:block lg:flex-1 lg:space-y-2 lg:overflow-visible lg:p-4">
          {/* Nút Dashboard (Thêm thuộc tính 'end' để URL khớp chính xác, không bị đè màu) */}
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `block shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition lg:px-4 ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-chart-pie mr-2" aria-hidden="true"></i> Dashboard
          </NavLink>

          {/* Nút Động vật */}
          <NavLink
            to="/admin/animals"
            className={({ isActive }) => `block shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition lg:px-4 ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-hippo mr-2" aria-hidden="true"></i> Động vật
          </NavLink>
          
          {/* Nút Zones */}
          <NavLink
            to="/admin/zones"
            className={({ isActive }) => `block shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition lg:px-4 ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-map-location-dot mr-2" aria-hidden="true"></i> Khu Động Vật
          </NavLink>
          
          <NavLink
            to="/admin/QrCode"
            className={({ isActive }) => `block shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition lg:px-4 ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-qrcode mr-2" aria-hidden="true"></i> Mã Trang Web
          </NavLink>
        </nav>

        <div className="border-t border-slate-800 p-2 text-sm sm:p-3 lg:p-4">
          <button onClick={logout} className="w-full px-4 py-2 rounded-xl font-bold text-slate-400 hover:bg-slate-800 text-left">
            <i className="fa-solid fa-right-from-bracket mr-2" aria-hidden="true"></i> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Vùng Nội Dung Chính */}
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Suspense fallback={<p className="p-6 text-sm text-slate-500">Đang tải…</p>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
} 
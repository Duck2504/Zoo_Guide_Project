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
        {/* Điện thoại: 4 ô chia đều, không phải cuộn ngang; máy tính: cột dọc */}
        <nav aria-label="Quản trị" className="grid grid-cols-4 gap-1 p-2 lg:block lg:flex-1 lg:space-y-2 lg:p-4">
          {/* Nút Dashboard (Thêm thuộc tính 'end' để URL khớp chính xác, không bị đè màu) */}
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center text-xs font-bold leading-tight transition lg:block lg:min-h-0 lg:px-4 lg:py-2 lg:text-left lg:text-sm ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-chart-pie lg:mr-2" aria-hidden="true"></i> <span>Tổng quan</span>
          </NavLink>

          {/* Nút Động vật */}
          <NavLink
            to="/admin/animals"
            className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center text-xs font-bold leading-tight transition lg:block lg:min-h-0 lg:px-4 lg:py-2 lg:text-left lg:text-sm ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-hippo lg:mr-2" aria-hidden="true"></i> <span>Động vật</span>
          </NavLink>
          
          {/* Nút Zones */}
          <NavLink
            to="/admin/zones"
            className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center text-xs font-bold leading-tight transition lg:block lg:min-h-0 lg:px-4 lg:py-2 lg:text-left lg:text-sm ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-map-location-dot lg:mr-2" aria-hidden="true"></i> <span>Khu vực</span>
          </NavLink>
          
          <NavLink
            to="/admin/QrCode"
            className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center text-xs font-bold leading-tight transition lg:block lg:min-h-0 lg:px-4 lg:py-2 lg:text-left lg:text-sm ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-qrcode lg:mr-2" aria-hidden="true"></i> <span>Mã QR</span>
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
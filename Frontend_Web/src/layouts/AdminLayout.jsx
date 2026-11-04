import { useState, useEffect } from 'react';
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
    <div className="flex h-screen bg-slate-100 text-slate-800">
      {/* Cột Sidebar Trái */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-black text-xl text-zoo-400">Zoo Admin</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* Nút Dashboard (Thêm thuộc tính 'end' để URL khớp chính xác, không bị đè màu) */}
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => `block px-4 py-2 rounded-xl font-bold text-sm transition ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-chart-pie mr-2"></i> Dashboard
          </NavLink>

          {/* Nút Động vật */}
          <NavLink
            to="/admin/animals"
            className={({ isActive }) => `block px-4 py-2 rounded-xl font-bold text-sm transition ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-hippo mr-2"></i> Động vật
          </NavLink>
          
          {/* Nút Zones */}
          <NavLink
            to="/admin/zones"
            className={({ isActive }) => `block px-4 py-2 rounded-xl font-bold text-sm transition ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-hippo mr-2"></i> Khu Động Vật
          </NavLink>
          
          <NavLink
            to="/admin/QrCode"
            className={({ isActive }) => `block px-4 py-2 rounded-xl font-bold text-sm transition ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-hippo mr-2"></i> Mã Trang Web
          </NavLink>
        </nav>

        <div className="p-4 border-t border-slate-800 text-sm">
          <button onClick={logout} className="w-full px-4 py-2 rounded-xl font-bold text-slate-400 hover:bg-slate-800 text-left">
            <i className="fa-solid fa-right-from-bracket mr-2"></i> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Vùng Nội Dung Chính */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
} 
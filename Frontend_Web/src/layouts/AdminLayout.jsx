import { Outlet, NavLink } from 'react-router-dom';

export default function AdminLayout() {
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
            to="/admin/audios"
            className={({ isActive }) => `block px-4 py-2 rounded-xl font-bold text-sm transition ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-hippo mr-2"></i> Tùy chỉnh Audio
          </NavLink>
        </nav>
      </aside>

      {/* Vùng Nội Dung Chính */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
} 
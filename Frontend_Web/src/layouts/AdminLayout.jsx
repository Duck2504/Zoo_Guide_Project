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
          <NavLink to="/admin" className="block px-4 py-2 rounded-xl bg-zoo-600 font-bold text-sm">
            <i className="fa-solid fa-chart-pie mr-2"></i> Dashboard
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
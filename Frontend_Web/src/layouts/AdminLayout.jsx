import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { getAdminKey, setAdminKey, ADMIN_KEY_INVALID } from '../utils/adminFetch';

export default function AdminLayout() {
  const [hasKey, setHasKey] = useState(() => !!getAdminKey());
  const [keyInput, setKeyInput] = useState('');
  const [keyRejected, setKeyRejected] = useState(false);

  // adminFetch báo khi server trả 401 → hiện lại ô nhập mã
  useEffect(() => {
    const onInvalid = () => { setHasKey(false); setKeyRejected(true); };
    window.addEventListener(ADMIN_KEY_INVALID, onInvalid);
    return () => window.removeEventListener(ADMIN_KEY_INVALID, onInvalid);
  }, []);

  const saveKey = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setAdminKey(keyInput.trim());
    setKeyInput('');
    setHasKey(true);
    setKeyRejected(false);
  };

  const clearKey = () => {
    setAdminKey('');
    setHasKey(false);
  };

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
            <i className="fa-solid fa-chart-pie mr-2"></i> Dashboard
          </NavLink>

          {/* Nút Động vật */}
          <NavLink
            to="/admin/animals"
            className={({ isActive }) => `block shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition lg:px-4 ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-hippo mr-2"></i> Động vật
          </NavLink>
          
          {/* Nút Zones */}
          <NavLink
            to="/admin/zones"
            className={({ isActive }) => `block shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition lg:px-4 ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-hippo mr-2"></i> Khu Động Vật
          </NavLink>
          
          <NavLink
            to="/admin/QrCode"
            className={({ isActive }) => `block shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold transition lg:px-4 ${isActive ? 'bg-zoo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-hippo mr-2"></i> Mã Trang Web
          </NavLink>
        </nav>

        {/* Mã quản trị: cần cho mọi thao tác thêm/sửa/xóa và thống kê */}
        <div className="border-t border-slate-800 p-2 text-sm sm:p-3 lg:p-4">
          {hasKey ? (
            <button onClick={clearKey} className="w-full px-4 py-2 rounded-xl font-bold text-slate-400 hover:bg-slate-800 text-left">
              <i className="fa-solid fa-key mr-2"></i> Đổi mã quản trị
            </button>
          ) : (
            <form onSubmit={saveKey} className="space-y-2">
              <label htmlFor="admin-key" className="block font-bold text-slate-300">
                {keyRejected ? 'Mã quản trị sai, nhập lại:' : 'Nhập mã quản trị:'}
              </label>
              <input
                id="admin-key"
                type="password"
                autoComplete="off"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
              <button type="submit" className="w-full bg-zoo-600 hover:bg-zoo-500 rounded-lg py-2 font-bold">Lưu mã</button>
            </form>
          )}
        </div>
      </aside>

      {/* Vùng Nội Dung Chính */}
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
} 
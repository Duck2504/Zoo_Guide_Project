import { Suspense, useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { getAdminToken, setAdminToken, ADMIN_AUTH_EXPIRED } from '../utils/adminFetch';
import { useDialog } from '../components/AdminFeedback';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [loggedIn] = useState(() => !!getAdminToken());
  const [expired, setExpired] = useState(false);
  useEffect(() => { document.documentElement.lang = 'vi'; }, []); // trang quản trị chỉ có tiếng Việt

  // adminFetch báo khi server trả 401 (token hết hạn) → hiện hộp nhắc; đăng nhập ở tab khác (token chung localStorage) thì tự đóng
  useEffect(() => {
    const onExpired = () => setExpired(true);
    const onStorage = () => { if (getAdminToken()) setExpired(false); };
    window.addEventListener(ADMIN_AUTH_EXPIRED, onExpired);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(ADMIN_AUTH_EXPIRED, onExpired); window.removeEventListener('storage', onStorage); };
  }, []);
  const expiredRef = useDialog(expired, () => { if (getAdminToken()) setExpired(false); });

  const logout = () => {
    setAdminToken('');
    navigate('/admin/login', { replace: true });
  };

  if (!loggedIn) return <Navigate to="/admin/login" replace />;

  const navLinkCls = ({ isActive }) =>
    `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-center text-xs font-bold leading-tight transition-all lg:flex-row lg:justify-start lg:gap-3 lg:min-h-0 lg:px-4 lg:py-2.5 lg:text-left lg:text-sm ${
      isActive
        ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-700/25'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-800 lg:flex-row">
      {/* Sidebar trái */}
      <aside className="flex w-full shrink-0 flex-col bg-slate-950 text-white lg:w-64 lg:border-r lg:border-slate-800">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md">
              <i className="fa-solid fa-leaf text-sm" aria-hidden="true"></i>
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white sm:text-lg">Zoo Admin</h2>
              <p className="hidden text-[11px] font-medium text-emerald-400/80 lg:block">Audio Guide CMS</p>
            </div>
          </div>
        </div>

        <nav aria-label="Quản trị" className="grid grid-cols-4 gap-1.5 p-2 lg:block lg:flex-1 lg:space-y-1.5 lg:p-4">
          <NavLink to="/admin" end className={navLinkCls}>
            <i className="fa-solid fa-chart-pie text-sm" aria-hidden="true"></i> <span>Tổng quan</span>
          </NavLink>
          <NavLink to="/admin/animals" className={navLinkCls}>
            <i className="fa-solid fa-hippo text-sm" aria-hidden="true"></i> <span>Động vật</span>
          </NavLink>
          <NavLink to="/admin/zones" className={navLinkCls}>
            <i className="fa-solid fa-map-location-dot text-sm" aria-hidden="true"></i> <span>Khu vực</span>
          </NavLink>
          <NavLink to="/admin/QrCode" className={navLinkCls}>
            <i className="fa-solid fa-qrcode text-sm" aria-hidden="true"></i> <span>Mã QR</span>
          </NavLink>
        </nav>

        <div className="border-t border-white/10 p-2 text-sm sm:p-3 lg:p-4 space-y-1.5">
          <NavLink to="/" className="hidden lg:flex items-center gap-3 rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-emerald-300">
            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> Xem trang du khách
          </NavLink>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-left text-sm font-bold text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400">
            <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Vùng Nội Dung Chính */}
      <main className="custom-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto">
        <Suspense fallback={<p className="p-6 text-sm text-slate-500">Đang tải…</p>}>
          <Outlet />
        </Suspense>
      </main>

      {expired && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4">
          <div ref={expiredRef} role="alertdialog" aria-modal="true" aria-labelledby="expired-title" aria-describedby="expired-text" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="expired-title" className="text-lg font-black text-slate-900">Phiên đăng nhập đã hết hạn</h2>
            <p id="expired-text" className="mt-2 text-sm leading-relaxed text-slate-600">
              Nội dung bạn đang nhập vẫn được giữ trên trang này. Hãy đăng nhập lại ở tab mới, quay lại đây rồi bấm Lưu lần nữa.
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <a href="/admin/login" target="_blank" rel="noopener" className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800">
                <i className="fa-solid fa-arrow-up-right-from-square mr-2" aria-hidden="true"></i>Đăng nhập ở tab mới
              </a>
              <button onClick={() => { if (getAdminToken()) setExpired(false); }} className="min-h-11 flex-1 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Tôi đã đăng nhập lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

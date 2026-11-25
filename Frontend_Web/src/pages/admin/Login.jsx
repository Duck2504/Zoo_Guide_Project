import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { API } from '../../config';
import { getAdminToken, setAdminToken } from '../../utils/adminFetch';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (getAdminToken()) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const { token } = await res.json();
        setAdminToken(token);
        navigate('/admin', { replace: true });
      } else if (res.status === 429) {
        setError('Bạn đã thử quá nhiều lần. Vui lòng đợi 1 phút rồi thử lại.');
      } else {
        setError('Sai tài khoản hoặc mật khẩu.');
      }
    } catch {
      setError('Không kết nối được tới máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 p-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/35 via-slate-950 to-slate-950" aria-hidden="true" />
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/25">
            <i className="fa-solid fa-leaf text-lg" aria-hidden="true"></i>
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-emerald-700">Zoo Audio Guide</span>
            <h1 className="text-xl font-extrabold text-slate-900">Đăng nhập quản trị</h1>
          </div>
        </div>
        <p className="text-sm text-slate-500">Quản lý hồ sơ con vật, tọa độ khu vực và hệ thống thuyết minh đa ngôn ngữ.</p>

        <div>
          <label htmlFor="admin-username" className="mb-1.5 block text-sm font-bold text-slate-700">Tài khoản</label>
          <input
            id="admin-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="mb-1.5 block text-sm font-bold text-slate-700">Mật khẩu</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 transition focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
            required
          />
        </div>

        {error && (
          <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-600">
            <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? <><i className="fa-solid fa-circle-notch animate-spin" aria-hidden="true"></i> Đang đăng nhập...</> : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}

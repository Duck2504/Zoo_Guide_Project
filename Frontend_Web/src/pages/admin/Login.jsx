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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-black text-slate-800">Đăng nhập quản trị</h1>

        <div>
          <label htmlFor="admin-username" className="block text-sm font-bold text-slate-600 mb-1">Tài khoản</label>
          <input
            id="admin-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-sm font-bold text-slate-600 mb-1">Mật khẩu</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-600 font-bold">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-xl font-bold transition"
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}

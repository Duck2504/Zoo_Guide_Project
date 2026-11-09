// Gọi API quản trị kèm token đăng nhập (Authorization: Bearer). Token lấy ở trang /admin/login.
const STORAGE_KEY = 'zoo_admin_token';
export const ADMIN_AUTH_EXPIRED = 'admin-auth-expired';

try { localStorage.removeItem('zoo_admin_key'); } catch { /* dọn mã cũ của cách đăng nhập trước */ }

export function getAdminToken() {
  try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
}

export function setAdminToken(token) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* trình duyệt chặn storage: phải đăng nhập lại khi tải lại trang */ }
}

export async function adminFetch(url, options = {}) {
  const token = getAdminToken();
  const res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${token}` } });
  // Token sai/hết hạn: xóa và báo AdminLayout chuyển về trang đăng nhập
  if (res.status === 401 && token) {
    setAdminToken('');
    window.dispatchEvent(new Event(ADMIN_AUTH_EXPIRED));
  }
  return res;
}

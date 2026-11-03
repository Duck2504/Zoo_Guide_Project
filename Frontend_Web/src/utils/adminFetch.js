// Gọi API quản trị kèm mã admin. Mã do admin tự nhập ở AdminLayout, KHÔNG để trong biến VITE_ (sẽ lộ trong bundle).
const STORAGE_KEY = 'zoo_admin_key';
export const ADMIN_KEY_INVALID = 'admin-key-invalid';

export function getAdminKey() {
  try { return localStorage.getItem(STORAGE_KEY) || ''; } catch { return ''; }
}

export function setAdminKey(key) {
  try {
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* trình duyệt chặn storage: mã chỉ mất khi tải lại trang */ }
}

export async function adminFetch(url, options = {}) {
  const key = getAdminKey();
  const res = await fetch(url, { ...options, headers: { ...options.headers, 'X-Admin-Key': key } });
  // Sai mã: xóa mã đã lưu và báo AdminLayout hiện lại ô nhập (không prompt ở đây để không làm phiền khi Dashboard polling).
  // Chưa nhập mã thì không báo "sai", ô nhập đang hiện sẵn rồi.
  if (res.status === 401 && key) {
    setAdminKey('');
    window.dispatchEvent(new Event(ADMIN_KEY_INVALID));
  }
  return res;
}

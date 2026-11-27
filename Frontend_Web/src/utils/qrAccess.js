// Quét mã QR (chuồng hoặc trang chủ) thì được dùng app du khách 1 phút; hết giờ phải quét lại.
// shortcut: mã in trên chuồng là link cố định nên mở lại link (F5, lịch sử) cũng tính là quét lại; muốn chặn thật phải có mã do server cấp.
export const ACCESS_MS = 60 * 1000;
export const ACCESS_EVENT = 'zoo-qr-access';
const KEY = 'zoo_qr_access_until';
const PRINTED_HOST = 'zooaudioguide-001-site1.ftempurl.com'; // host in trên mã QR (AnimalManager, HomeAccessManager)

let memoryUntil = 0; // chế độ ẩn danh chặn localStorage thì vẫn nhớ trong lúc trang còn mở

// Đường dẫn của mã QR do vườn in: trang con vật /a/{id} hoặc trang chủ /
export const isZooQrPath = pathname => /^\/(a\/\d+\/?)?$/.test(pathname);

// Mã quét bằng camera trong app: chỉ nhận link của vườn, không nhận mã QR bất kỳ có đường dẫn "/"
export function isZooQrUrl(text, currentHost) {
  try {
    const url = new URL(text);
    return (url.host === PRINTED_HOST || url.host === currentHost) && isZooQrPath(url.pathname);
  } catch { return false; }
}

// Trang được mở từ mã QR: link trang con vật, hoặc trang chủ có ?source=qr_home
export const isQrEntry = (pathname, search) =>
  /^\/a\/\d+\/?$/.test(pathname) || (pathname === '/' && new URLSearchParams(search).get('source') === 'qr_home');

export function accessLeft(now = Date.now()) {
  let until = memoryUntil;
  try { until = Math.max(until, Number(localStorage.getItem(KEY)) || 0); } catch { /* dùng bản trong bộ nhớ */ }
  return Math.max(0, until - now);
}

export function grantAccess(now = Date.now()) {
  memoryUntil = now + ACCESS_MS;
  try { localStorage.setItem(KEY, String(memoryUntil)); } catch { /* chỉ nhớ trong bộ nhớ */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(ACCESS_EVENT));
}

// Chỉ xét URL lúc tải trang một lần: bấm link trong app sang /a/{id} không được tính thêm giờ
if (typeof window !== 'undefined' && window.location && isQrEntry(window.location.pathname, window.location.search)) grantAccess();

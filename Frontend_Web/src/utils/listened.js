// Nhớ những con du khách đã nghe, chỉ trên máy của họ. Báo cho danh sách cập nhật dấu ✓ qua sự kiện.
const KEY = 'zoo_listened';
export const LISTENED_EVENT = 'zoo:listened';

export function getListened() {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { return new Set(); }
}

export function markListened(animalId) {
  const ids = getListened();
  if (ids.has(animalId)) return;
  ids.add(animalId);
  try { localStorage.setItem(KEY, JSON.stringify([...ids])); } catch { /* chế độ ẩn danh: chỉ mất dấu ✓ */ }
  window.dispatchEvent(new Event(LISTENED_EVENT));
}

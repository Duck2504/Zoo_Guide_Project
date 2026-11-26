// Nhớ những con du khách đã nghe, chỉ trên máy của họ. Báo cho danh sách cập nhật dấu ✓ qua sự kiện.
// Dấu chỉ giữ trong ngày: hôm sau quay lại vườn là một lượt tham quan mới, "Nghe tiếp" gợi ý lại từ đầu.
const KEY = 'zoo_listened';
export const LISTENED_EVENT = 'zoo:listened';

const today = () => new Date().toDateString(); // theo giờ trên máy du khách

export function getListened() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    // Dạng cũ (mảng không kèm ngày) hoặc của ngày trước: coi như chưa nghe con nào
    return saved?.day === today() && Array.isArray(saved.ids) ? new Set(saved.ids) : new Set();
  } catch { return new Set(); }
}

export function markListened(animalId) {
  const ids = getListened();
  if (ids.has(animalId)) return;
  ids.add(animalId);
  try { localStorage.setItem(KEY, JSON.stringify({ day: today(), ids: [...ids] })); } catch { /* chế độ ẩn danh: chỉ mất dấu ✓ */ }
  window.dispatchEvent(new Event(LISTENED_EVENT));
}

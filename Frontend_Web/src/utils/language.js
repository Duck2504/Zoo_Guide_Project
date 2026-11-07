// Ngôn ngữ khách đã chọn được nhớ trên máy, để quét chuồng tiếp theo không phải chọn lại
export const LANGUAGE_KEY = 'zoo_language';

// Thứ tự: ngôn ngữ đã chọn trước đó → tiếng Việt nếu điện thoại có tiếng Việt (nhiều máy người Việt đặt tiếng Anh
// nhưng vẫn kèm vi) → ngôn ngữ điện thoại đầu tiên có hỗ trợ → tiếng Việt.
export function pickLanguage(saved, browserLanguages, available) {
  if (saved && available.includes(saved)) return saved;
  const bases = (browserLanguages || []).map(l => String(l).toLowerCase().split('-')[0]);
  if (bases.includes('vi')) return 'vi';
  return bases.find(b => available.includes(b)) || 'vi';
}

export function readSavedLanguage() {
  try { return localStorage.getItem(LANGUAGE_KEY); } catch { return null; } // chế độ ẩn danh có thể chặn
}

export function saveLanguage(code) {
  try { localStorage.setItem(LANGUAGE_KEY, code); } catch { /* không nhớ được thì thôi */ }
}

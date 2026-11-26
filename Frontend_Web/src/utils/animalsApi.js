import { API } from '../config';

// Danh sách con vật tải một lần cho mỗi ngôn ngữ, dùng chung cho trang chủ, bản đồ, trang con vật và theo dõi khu.
// shortcut: giữ suốt phiên, quản trị sửa con vật thì du khách phải tải lại trang mới thấy; thêm thời hạn nếu cần dữ liệu tươi hơn.
const cache = {};

export function getAnimals(lang) {
  cache[lang] ??= fetch(`${API}/api/animals?lang=${lang}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .catch(err => {
      delete cache[lang]; // lỗi thì lần sau tải lại, không nhớ lỗi
      throw err;
    });
  return cache[lang];
}

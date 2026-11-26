// Ảnh Wikimedia dạng .../thumb/.../960px-Ten.jpg: đổi sang bản thu nhỏ đúng cỡ đang hiện để nhẹ cho mạng 4G.
// Chỉ thu nhỏ (không phóng to), link khác giữ nguyên. Dùng cỡ chuẩn của Wikimedia (330, 500, 960) để có sẵn trong cache của họ.
export function commonsThumb(url, px) {
  const m = /^(https:\/\/[^/]*wikimedia\.org\/.*\/thumb\/.+\/)(\d+)px-([^/]+)$/.exec(url || '');
  if (!m || Number(m[2]) <= px) return url;
  return `${m[1]}${px}px-${m[3]}`;
}

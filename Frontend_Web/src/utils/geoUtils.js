// src/utils/geoUtils.js
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Bán kính Trái Đất tính bằng mét
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const deltaP = (lat2 - lat1) * Math.PI / 180;
  const deltaLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Trả về khoảng cách bằng mét
}

// GPS hay nhảy qua lại ở mép khu: vào khi d <= bán kính, chỉ coi là ra khi d > bán kính + EXIT_BUFFER
export const EXIT_BUFFER_M = 10;
// Lần đo có sai số lớn hơn mức này thì bỏ qua (thường là định vị qua wifi/trạm phát)
export const MAX_ACCURACY_M = 50;

// /api/animals trả mỗi con kèm tọa độ khu: gom lại thành danh sách khu, mỗi khu có các con của nó
export function groupZones(animals) {
  const byZone = new Map();
  for (const a of animals) {
    if (!byZone.has(a.zoneId)) {
      byZone.set(a.zoneId, { id: a.zoneId, name: a.zoneName, lat: a.latitude, lng: a.longitude, radius: a.radiusMeters, animals: [] });
    }
    byZone.get(a.zoneId).animals.push(a);
  }
  return [...byZone.values()];
}

// Trả { inZone, nearest, distance }:
// - inZone: khu đang đứng (giữ khu hiện tại tới khi ra khỏi vùng đệm; nhiều khu cùng chứa thì lấy tâm gần nhất)
// - nearest/distance: khu gần nhất và khoảng cách tới tâm (dùng khi đang ở ngoài mọi khu)
export function locateZone(position, zones, currentZoneId = null) {
  let inZone = null, nearest = null, distance = Infinity, inZoneDist = Infinity;
  for (const z of zones) {
    const d = calculateDistance(position.lat, position.lng, z.lat, z.lng);
    if (d < distance) { nearest = z; distance = d; }
    if (z.id === currentZoneId && d <= z.radius + EXIT_BUFFER_M) return { inZone: z, nearest: z, distance: d };
    if (d <= z.radius && d < inZoneDist) { inZone = z; inZoneDist = d; }
  }
  return { inZone, nearest, distance: nearest ? distance : null };
}

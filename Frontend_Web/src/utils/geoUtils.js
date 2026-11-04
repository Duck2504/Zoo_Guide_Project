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
// Tìm con vật đầu tiên (mỗi khu lấy một con) có khu chứa vị trí hiện tại và khu đó chưa phát trong phiên.
export function findEnteredAnimal(location, animals, playedZoneIds) {
  const seenZones = new Set();
  for (const a of animals) {
    if (seenZones.has(a.zoneId)) continue;
    seenZones.add(a.zoneId);
    if (playedZoneIds.has(a.zoneId)) continue;
    if (calculateDistance(location.lat, location.lng, a.latitude, a.longitude) <= a.radiusMeters) return a;
  }
  return null;
}

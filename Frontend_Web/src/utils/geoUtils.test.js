// Chạy: npm test (node --test, không cần thư viện thêm)
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistance, groupZones, locateZone } from './geoUtils.js';

// Hai khu cách nhau ~104 m như khu 1 và 2 ngoài vườn, bán kính 45 m
const animals = [
  { id: 1, zoneId: 1, zoneName: 'Khu Linh trưởng', latitude: 10.7875, longitude: 106.7052, radiusMeters: 45 },
  { id: 2, zoneId: 1, zoneName: 'Khu Linh trưởng', latitude: 10.7875, longitude: 106.7052, radiusMeters: 45 },
  { id: 5, zoneId: 2, zoneName: 'Khu Bò sát', latitude: 10.788, longitude: 106.706, radiusMeters: 45 },
];
const zones = groupZones(animals);
// Dời về phía bắc d mét so với tâm khu 1 (0.001 độ vĩ ≈ 111 m)
const north = m => ({ lat: 10.7875 + m / 111195, lng: 106.7052 });

test('calculateDistance: 0.001 độ vĩ ≈ 111 m', () => {
  assert.ok(Math.abs(calculateDistance(10, 106, 10.001, 106) - 111.2) < 1);
});

test('groupZones gom con vật theo khu, giữ tên và bán kính', () => {
  assert.equal(zones.length, 2);
  assert.deepEqual(zones[0].animals.map(a => a.id), [1, 2]);
  assert.equal(zones[0].name, 'Khu Linh trưởng');
  assert.equal(zones[0].radius, 45);
});

test('đứng giữa khu thì ở trong khu đó', () => {
  assert.equal(locateZone(north(0), zones).inZone.id, 1);
});

test('ngoài mọi khu thì trả khu gần nhất và khoảng cách', () => {
  const r = locateZone(north(-200), zones);
  assert.equal(r.inZone, null);
  assert.equal(r.nearest.id, 1);
  assert.ok(Math.abs(r.distance - 200) < 2);
});

test('vùng đệm: 50 m chưa vào được, nhưng đang ở trong thì vẫn giữ', () => {
  assert.equal(locateZone(north(-50), zones, null).inZone, null);
  assert.equal(locateZone(north(-50), zones, 1).inZone.id, 1);
  assert.equal(locateZone(north(-56), zones, 1).inZone, null); // quá 45 + 10 m thì ra
});

test('đang giữ khu 1 trong vùng đệm thì không nhảy sang khu 2 dù đã vào bán kính khu 2', () => {
  // Điểm nằm trong vùng đệm của khu 1 và trong bán kính khu 2 không tồn tại khi 2r + 10 < khoảng cách;
  // kiểm tra trực tiếp quy tắc ưu tiên khu hiện tại bằng hai khu chồng nhau
  const overlap = groupZones([
    { id: 1, zoneId: 1, latitude: 10.7875, longitude: 106.7052, radiusMeters: 45 },
    { id: 9, zoneId: 9, latitude: 10.7878, longitude: 106.7052, radiusMeters: 45 },
  ]);
  const p = north(30); // gần tâm khu 9 hơn
  assert.equal(locateZone(p, overlap, null).inZone.id, 9); // mới vào: chọn tâm gần nhất
  assert.equal(locateZone(p, overlap, 1).inZone.id, 1);    // đang ở khu 1: giữ nguyên
});

test('không có khu nào thì không lỗi', () => {
  assert.deepEqual(locateZone(north(0), []), { inZone: null, nearest: null, distance: null });
});

// Chạy: npm test (node --test, không cần thư viện thêm)
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistance, findEnteredAnimal } from './geoUtils.js';

const tiger = { id: 1, zoneId: 10, latitude: 10.7875, longitude: 106.7053, radiusMeters: 15 };
const lion = { id: 2, zoneId: 10, latitude: 10.7875, longitude: 106.7053, radiusMeters: 15 };
const monkey = { id: 3, zoneId: 20, latitude: 10.7880, longitude: 106.7060, radiusMeters: 20 };
const animals = [tiger, lion, monkey];

test('calculateDistance: 0.001 độ vĩ ≈ 111 m', () => {
  assert.ok(Math.abs(calculateDistance(10, 106, 10.001, 106) - 111.2) < 1);
});

test('đứng trong khu thì trả con vật đầu tiên của khu đó', () => {
  assert.equal(findEnteredAnimal({ lat: 10.7875, lng: 106.7053 }, animals, new Set()), tiger);
});

test('khu đã phát rồi thì không trả lại nữa', () => {
  assert.equal(findEnteredAnimal({ lat: 10.7875, lng: 106.7053 }, animals, new Set([10])), null);
});

test('ngoài mọi bán kính thì trả null', () => {
  assert.equal(findEnteredAnimal({ lat: 10.80, lng: 106.72 }, animals, new Set()), null);
});

test('khu thứ hai vẫn được nhận', () => {
  assert.equal(findEnteredAnimal({ lat: 10.7880, lng: 106.7060 }, animals, new Set()), monkey);
});

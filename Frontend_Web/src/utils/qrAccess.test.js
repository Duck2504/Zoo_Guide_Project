import test from 'node:test';
import assert from 'node:assert/strict';

// localStorage giả cho node; không có window nên module không tự cấp giờ khi import
const store = {};
globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } };
const { ACCESS_MS, accessLeft, grantAccess, isQrEntry, isZooQrUrl } = await import('./qrAccess.js');

test('chưa quét thì không có giờ dùng', () => {
  assert.equal(accessLeft(), 0);
});

test('quét xong được đúng 1 phút rồi hết', () => {
  grantAccess(1000);
  assert.equal(accessLeft(1000), ACCESS_MS);
  assert.equal(accessLeft(1000 + ACCESS_MS - 1), 1);
  assert.equal(accessLeft(1000 + ACCESS_MS), 0);
});

test('quét lại thì tính lại từ đầu', () => {
  grantAccess(0);
  grantAccess(50_000);
  assert.equal(accessLeft(100_000), 10_000);
});

test('link nào tính là mở từ mã QR', () => {
  assert.ok(isQrEntry('/a/12', ''));
  assert.ok(isQrEntry('/', '?source=qr_home'));
  assert.ok(!isQrEntry('/', ''));
  assert.ok(!isQrEntry('/map', '?source=qr_home'));
});

test('máy quét trong app chỉ nhận mã của vườn', () => {
  assert.ok(isZooQrUrl('https://zooaudioguide-001-site1.ftempurl.com/a/3', 'localhost:5173'));
  assert.ok(isZooQrUrl('http://localhost:5173/?source=qr_home', 'localhost:5173'));
  assert.ok(!isZooQrUrl('https://shop.example.com/', 'localhost:5173'));
  assert.ok(!isZooQrUrl('https://zooaudioguide-001-site1.ftempurl.com/admin', 'localhost:5173'));
  assert.ok(!isZooQrUrl('khong phai link', 'localhost:5173'));
});

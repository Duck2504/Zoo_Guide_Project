import test from 'node:test';
import assert from 'node:assert/strict';

// localStorage và window giả cho node
const store = {};
globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } };
globalThis.window = { dispatchEvent: () => {} };
const { getListened, markListened } = await import('./listened.js');

test('đánh dấu rồi đọc lại trong ngày', () => {
  delete store.zoo_listened;
  markListened(3);
  markListened(5);
  assert.deepEqual([...getListened()].sort(), [3, 5]);
});

test('dấu của ngày trước không còn', () => {
  store.zoo_listened = JSON.stringify({ day: 'Mon Jan 01 2001', ids: [1, 2] });
  assert.equal(getListened().size, 0);
});

test('dạng lưu cũ (mảng) hoặc hỏng thì không lỗi', () => {
  store.zoo_listened = '[1,2,3]';
  assert.equal(getListened().size, 0);
  store.zoo_listened = '{hỏng';
  assert.equal(getListened().size, 0);
});

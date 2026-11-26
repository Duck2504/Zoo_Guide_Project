import test from 'node:test';
import assert from 'node:assert/strict';
import { commonsThumb } from './commonsThumb.js';

const big = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Tanjung_Puting30477.jpg/960px-Tanjung_Puting30477.jpg';

test('đổi bản 960px sang cỡ nhỏ hơn', () => {
  assert.equal(commonsThumb(big, 330), big.replace('/960px-', '/330px-'));
});

test('không phóng to, không đụng link khác', () => {
  assert.equal(commonsThumb(big, 1280), big);
  assert.equal(commonsThumb('https://example.com/a/500px-x.jpg', 330), 'https://example.com/a/500px-x.jpg');
  assert.equal(commonsThumb('', 330), '');
});

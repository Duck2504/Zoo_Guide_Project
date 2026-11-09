import test from 'node:test';
import assert from 'node:assert/strict';
import { pickLanguage, readSavedLanguage } from './language.js';

const all = ['vi', 'en', 'ja', 'ko'];

test('ngôn ngữ đã chọn trước đó được giữ', () => {
  assert.equal(pickLanguage('ja', ['en-US'], all), 'ja');
});

test('lấy theo điện thoại: ko-KR → ko', () => {
  assert.equal(pickLanguage(null, ['ko-KR', 'en'], all), 'ko');
});

test('điện thoại có tiếng Việt thì ưu tiên tiếng Việt dù đứng sau', () => {
  assert.equal(pickLanguage(null, ['en-US', 'vi-VN'], all), 'vi');
});

test('ngôn ngữ chưa hỗ trợ hoặc đã bị gỡ thì về tiếng Việt', () => {
  assert.equal(pickLanguage(null, ['fr-FR'], all), 'vi');
  assert.equal(pickLanguage('zh', undefined, all), 'vi');
});

test('không đọc được bộ nhớ thì không lỗi', () => {
  assert.equal(readSavedLanguage(), null); // node không có localStorage → bị bắt lỗi
});

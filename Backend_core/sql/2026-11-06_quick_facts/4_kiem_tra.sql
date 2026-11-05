-- BƯỚC 4/4: kiểm tra. Phải thấy 17 dòng đủ ảnh + thông tin, và cột AnimalId is_nullable = 1.
-- Chỉ dùng câu lệnh thường (không GO/SET/DECLARE/transaction) để chạy được trong SQL Studio của hosting.

SELECT a.Id, c.LocalName, a.ScientificName, a.ConservationStatus, a.Diet, a.Habitat, a.LifespanYears, LEFT(a.AvatarUrl, 60) AS Avatar
FROM Animals a LEFT JOIN AnimalContents c ON c.AnimalId = a.Id AND c.LanguageCode = 'vi'
ORDER BY a.Id;

SELECT name, is_nullable FROM sys.columns WHERE object_id = OBJECT_ID('SCAN_LOGS') AND name = 'AnimalId';

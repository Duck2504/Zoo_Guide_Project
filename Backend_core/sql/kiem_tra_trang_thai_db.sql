-- KIỂM TRA (chỉ đọc, không sửa gì): schema trên DB thật có khớp với các migration trong code không.
-- Chỉ dùng câu lệnh thường (không GO/SET/DECLARE/transaction) để chạy được trong SQL Studio của hosting.

-- 1) Migration EF đã ghi nhận. Code hiện có 4: InitialCreate, AddScanLogsTable, AddAnimalQuickFacts, AddZoneName.
SELECT MigrationId, ProductVersion FROM [__EFMigrationsHistory] ORDER BY MigrationId;

-- 2) Zones.Name (migration AddZoneName). Không ra dòng nào = cột chưa có, mọi API đọc khu/con vật sẽ lỗi 500.
SELECT name, is_nullable FROM sys.columns WHERE object_id = OBJECT_ID('Zones') AND name = 'Name';

-- 3) SCAN_LOGS.AnimalId phải is_nullable = 1 (bước 3 của 2026-11-06_quick_facts).
--    Nếu = 0 thì lượt vào trang chủ/bản đồ ghi log sẽ lỗi, dù bảng lịch sử ở mục 1 nói migration đã chạy.
SELECT name, is_nullable FROM sys.columns WHERE object_id = OBJECT_ID('SCAN_LOGS') AND name = 'AnimalId';

-- 4) 4 cột thông tin nhanh của Animals (AddAnimalQuickFacts): phải ra đủ 4 dòng.
SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('Animals')
  AND name IN ('ConservationStatus', 'Diet', 'Habitat', 'LifespanYears');

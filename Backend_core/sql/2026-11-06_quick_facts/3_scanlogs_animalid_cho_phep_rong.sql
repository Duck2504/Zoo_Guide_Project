-- BƯỚC 3/4: cho SCAN_LOGS.AnimalId được rỗng (lượt vào trang chủ không gắn con vật nào).
-- Nếu báo lỗi 'does not exist' ở câu đầu: có thể DB đã khác tên ràng buộc/index -> gửi lỗi cho mình.
-- Chỉ dùng câu lệnh thường (không GO/SET/DECLARE/transaction) để chạy được trong SQL Studio của hosting.

ALTER TABLE [SCAN_LOGS] DROP CONSTRAINT [FK_SCAN_LOGS_Animals_AnimalId];
DROP INDEX [IX_SCAN_LOGS_AnimalId_ScannedAt] ON [SCAN_LOGS];
ALTER TABLE [SCAN_LOGS] ALTER COLUMN [AnimalId] int NULL;
CREATE INDEX [IX_SCAN_LOGS_AnimalId_ScannedAt] ON [SCAN_LOGS] ([AnimalId], [ScannedAt]);
ALTER TABLE [SCAN_LOGS] ADD CONSTRAINT [FK_SCAN_LOGS_Animals_AnimalId] FOREIGN KEY ([AnimalId]) REFERENCES [Animals] ([Id]);

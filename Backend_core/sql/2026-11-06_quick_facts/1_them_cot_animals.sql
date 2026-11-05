-- BƯỚC 1/4: thêm 4 cột thông tin nhanh. Chạy TRƯỚC khi deploy backend mới.
-- Chỉ dùng câu lệnh thường (không GO/SET/DECLARE/transaction) để chạy được trong SQL Studio của hosting.

ALTER TABLE [Animals] ADD
    [ConservationStatus] nvarchar(max) NULL,
    [Diet] nvarchar(max) NULL,
    [Habitat] nvarchar(max) NULL,
    [LifespanYears] int NULL;

-- Ghi nhận cho EF biết migration này đã áp dụng
INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261105201420_AddAnimalQuickFacts', N'10.0.13');

using System.Linq;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Models;
using ZooAudioGuide.API.Repositories;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.Tests;

[TestClass]
public sealed class ZoneAndScanLogTests
{
    // NetTopologySuite nhận (X, Y) = (Longitude, Latitude); đảo nhầm là mọi khu nằm giữa biển
    [TestMethod]
    public async Task CreateZone_StoresLongitudeAsX_LatitudeAsY_AndReadsBack()
    {
        var repo = new FakeZoneRepo();
        var service = new ZoneService(repo);

        await service.CreateZoneAsync(new ZoneCreateDto { ZoneCode = "Z", Name = "  Khu Bò sát ", Latitude = 10.78, Longitude = 106.70, Radius = 20 });

        var zone = repo.Added!;
        Assert.AreEqual(106.70, zone.Location.X);
        Assert.AreEqual(10.78, zone.Location.Y);
        Assert.AreEqual(4326, zone.Location.SRID);

        var dto = await service.GetZoneByIdAsync(zone.Id);
        Assert.AreEqual(10.78, dto!.Latitude);
        Assert.AreEqual(106.70, dto.Longitude);
        Assert.AreEqual("Khu Bò sát", dto.Name); // tên được cắt khoảng trắng
    }

    [TestMethod]
    public async Task CreateOrUpdateZone_RejectsOverlappingZones_AllowsSelfUpdateAndNonOverlapping()
    {
        var repo = new FakeZoneRepo();
        var service = new ZoneService(repo);

        // Khu 1: bán kính 45m tại (10.7875, 106.7052)
        var z1 = await service.CreateZoneAsync(new ZoneCreateDto { ZoneCode = "Z1", Name = "Khu 1", Latitude = 10.7875, Longitude = 106.7052, Radius = 45 });

        // Khu mới cách tâm ~55m với bán kính 45m (55 < 90) -> đè lên nhau -> phải chặn
        await Assert.ThrowsExactlyAsync<InvalidOperationException>(() =>
            service.CreateZoneAsync(new ZoneCreateDto { ZoneCode = "Z2", Name = "Khu 2", Latitude = 10.7880, Longitude = 106.7052, Radius = 45 }));

        // Khu 2 cách tâm ~111m (0.001 độ vĩ) với bán kính 45m (111 >= 90) -> hợp lệ
        var z2 = await service.CreateZoneAsync(new ZoneCreateDto { ZoneCode = "Z2", Name = "Khu 2", Latitude = 10.7885, Longitude = 106.7052, Radius = 45 });

        // Cập nhật chính Khu 2 tại vị trí không đè lên Khu 1 -> hợp lệ (không tự đụng chính mình)
        var updatedOk = await service.UpdateZoneAsync(z2.Id, new ZoneCreateDto { ZoneCode = "Z2", Name = "Khu 2 mới", Latitude = 10.7886, Longitude = 106.7052, Radius = 45 });
        Assert.IsTrue(updatedOk);

        // Cập nhật Khu 2 tăng bán kính lên 80m (80 + 45 = 125 > ~122m) -> đè Khu 1 -> phải chặn
        await Assert.ThrowsExactlyAsync<InvalidOperationException>(() =>
            service.UpdateZoneAsync(z2.Id, new ZoneCreateDto { ZoneCode = "Z2", Name = "Khu 2 mới", Latitude = 10.7886, Longitude = 106.7052, Radius = 80 }));
        Assert.AreEqual(2, (await repo.GetAllAsync()).Count());
        Assert.AreEqual(1, z1.Id);
    }

    [TestMethod]
    public async Task RecordLog_UnknownAnimalBecomesNull_KnownKept_UserAgentCut()
    {
        var repo = new FakeScanLogRepo(knownAnimalId: 5);
        var service = new ScanLogService(repo);

        await service.RecordLogAsync(new ScanLogCreateDto { AnimalId = 999, SessionId = "s", Source = "web" }, new string('u', 300));
        await service.RecordLogAsync(new ScanLogCreateDto { AnimalId = 5, SessionId = "s", Source = "web" }, "short");

        Assert.IsNull(repo.Logs[0].AnimalId);
        Assert.AreEqual(255, repo.Logs[0].UserAgent!.Length);
        Assert.AreEqual(5, repo.Logs[1].AnimalId);
        Assert.AreEqual("short", repo.Logs[1].UserAgent);
    }

    [TestMethod]
    public async Task RecordLog_SkipsBots_UnknownSources_AndRepeatsWithinWindow()
    {
        var repo = new FakeScanLogRepo(knownAnimalId: 5);
        var service = new ScanLogService(repo);
        const string phone = "Mozilla/5.0 (iPhone) Safari";

        await service.RecordLogAsync(new() { AnimalId = 5, SessionId = "a", Source = "web" }, "Mozilla/5.0 HeadlessChrome/140");
        await service.RecordLogAsync(new() { AnimalId = 5, SessionId = "a", Source = "web" }, "Googlebot/2.1");
        await service.RecordLogAsync(new() { AnimalId = 5, SessionId = "a", Source = "web" }, "");
        await service.RecordLogAsync(new() { AnimalId = 5, SessionId = "a", Source = "claude_check" }, phone);
        await service.RecordLogAsync(new() { AnimalId = 5, SessionId = "", Source = "web" }, phone);
        Assert.AreEqual(0, repo.Logs.Count);

        await service.RecordLogAsync(new() { AnimalId = 5, SessionId = "a", Source = "web" }, phone);
        await service.RecordLogAsync(new() { AnimalId = 5, SessionId = "a", Source = "zone" }, phone);   // tải lại: bỏ
        await service.RecordLogAsync(new() { AnimalId = null, SessionId = "a", Source = "web_home" }, phone); // trang khác: tính
        await service.RecordLogAsync(new() { AnimalId = null, SessionId = "a", Source = "web_home" }, phone); // trang chủ lần 2: bỏ
        await service.RecordLogAsync(new() { AnimalId = 5, SessionId = "b", Source = "web" }, phone);    // khách khác: tính
        Assert.AreEqual(3, repo.Logs.Count);

        repo.Logs[0].ScannedAt -= ScanLogService.RepeatWindow; // quá 5 phút thì tính lượt mới
        await service.RecordLogAsync(new() { AnimalId = 5, SessionId = "a", Source = "web" }, phone);
        Assert.AreEqual(4, repo.Logs.Count);
    }

    private sealed class FakeZoneRepo : IZoneRepository
    {
        public List<Zone> Zones = [];
        public Zone? Added => Zones.LastOrDefault();
        public IQueryable<Zone> GetZonesWithDetails() => Zones.AsQueryable();
        public Task<IEnumerable<Zone>> GetAllAsync() => Task.FromResult<IEnumerable<Zone>>(Zones);
        public Task<Zone?> GetByIdAsync(int id) => Task.FromResult(Zones.FirstOrDefault(z => z.Id == id));
        public Task AddAsync(Zone zone) { zone.Id = Zones.Count + 1; Zones.Add(zone); return Task.CompletedTask; }
        public Task UpdateAsync(Zone zone) => Task.CompletedTask;
        public Task DeleteAsync(Zone zone) { Zones.Remove(zone); return Task.CompletedTask; }
        public Task SaveChangesAsync() => Task.CompletedTask;
        public Task<bool> HasAnimalsAsync(int zoneId) => Task.FromResult(false);
    }

    private sealed class FakeScanLogRepo(int knownAnimalId) : IScanLogRepository
    {
        public List<ScanLog> Logs = [];
        public Task AddLogAsync(ScanLog log) { Logs.Add(log); return Task.CompletedTask; }
        public Task<bool> AnimalExistsAsync(int animalId) => Task.FromResult(animalId == knownAnimalId);
        public Task<bool> HasRecentAsync(string sessionId, int? animalId, DateTime since) =>
            Task.FromResult(Logs.Any(l => l.SessionId == sessionId && l.AnimalId == animalId && l.ScannedAt >= since));
    }
}

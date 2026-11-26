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
        public Zone? Added;
        public IQueryable<Zone> GetZonesWithDetails() => Enumerable.Empty<Zone>().AsQueryable();
        public Task<IEnumerable<Zone>> GetAllAsync() => Task.FromResult<IEnumerable<Zone>>(Added is null ? [] : [Added]);
        public Task<Zone?> GetByIdAsync(int id) => Task.FromResult(Added?.Id == id ? Added : null);
        public Task AddAsync(Zone zone) { zone.Id = 1; Added = zone; return Task.CompletedTask; }
        public Task UpdateAsync(Zone zone) => Task.CompletedTask;
        public Task DeleteAsync(Zone zone) => Task.CompletedTask;
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

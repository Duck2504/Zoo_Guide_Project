using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Filters;
using ZooAudioGuide.API.Models;
using ZooAudioGuide.API.Repositories;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.Tests;

[TestClass]
public sealed class AdminAccessTests
{
    [TestMethod]
    [DataRow(null, "abc", false, DisplayName = "Server chưa cấu hình key")]
    [DataRow("secret", null, false, DisplayName = "Thiếu header")]
    [DataRow("secret", "wrong", false, DisplayName = "Sai key")]
    [DataRow("secret", "secret", true, DisplayName = "Đúng key")]
    [DataRow("secret\n", "secret", true, DisplayName = "Key cấu hình dính xuống dòng")]
    public void AdminKey_OnlyAllowsMatchingKey(string? configured, string? sent, bool allowed)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Admin:ApiKey"] = configured })
            .Build();
        var http = new DefaultHttpContext
        {
            RequestServices = new ServiceCollection().AddSingleton<IConfiguration>(config).BuildServiceProvider()
        };
        if (sent != null) http.Request.Headers[AdminKeyAttribute.HeaderName] = sent;
        var ctx = new AuthorizationFilterContext(new ActionContext(http, new RouteData(), new ActionDescriptor()), []);

        new AdminKeyAttribute().OnAuthorization(ctx);

        if (allowed) Assert.IsNull(ctx.Result);
        else Assert.IsInstanceOfType<UnauthorizedObjectResult>(ctx.Result);
    }

    // Chặn trường hợp sau này thêm endpoint ghi mới mà quên gắn [AdminKey]
    [TestMethod]
    public void EveryWriteEndpoint_RequiresAdminKey_ExceptScanLogs()
    {
        var unprotected = typeof(AdminKeyAttribute).Assembly.GetTypes()
            .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract)
            .SelectMany(t => t.GetMethods().Select(m => (t, m)))
            .Where(x => x.m.GetCustomAttributes(true).Any(a => a is HttpPostAttribute or HttpPutAttribute or HttpDeleteAttribute))
            .Where(x => !x.m.IsDefined(typeof(AdminKeyAttribute), true) && !x.t.IsDefined(typeof(AdminKeyAttribute), true))
            .Select(x => $"{x.t.Name}.{x.m.Name}")
            .ToList();

        CollectionAssert.AreEqual(new[] { "ScanLogsController.CreateLog" }, unprotected);
    }

    [TestMethod]
    public async Task DeleteZone_WithAnimals_IsRefused_AndNothingDeleted()
    {
        var repo = new FakeZoneRepo(hasAnimals: true);
        var service = new ZoneService(repo);

        await Assert.ThrowsExactlyAsync<InvalidOperationException>(() => service.DeleteZoneAsync(1));
        Assert.IsFalse(repo.Deleted);
    }

    [TestMethod]
    public async Task DeleteZone_Empty_IsDeleted()
    {
        var repo = new FakeZoneRepo(hasAnimals: false);

        Assert.IsTrue(await new ZoneService(repo).DeleteZoneAsync(1));
        Assert.IsTrue(repo.Deleted);
    }

    private sealed class FakeZoneRepo(bool hasAnimals) : IZoneRepository
    {
        public bool Deleted;
        private readonly Zone _zone = new() { Id = 1, ZoneCode = "Z1" };
        public IQueryable<Zone> GetZonesWithDetails() => new[] { _zone }.AsQueryable();
        public Task<IEnumerable<Zone>> GetAllAsync() => Task.FromResult<IEnumerable<Zone>>([_zone]);
        public Task<Zone?> GetByIdAsync(int id) => Task.FromResult(id == 1 ? _zone : null);
        public Task AddAsync(Zone zone) => Task.CompletedTask;
        public Task UpdateAsync(Zone zone) => Task.CompletedTask;
        public Task DeleteAsync(Zone zone) { Deleted = true; return Task.CompletedTask; }
        public Task SaveChangesAsync() => Task.CompletedTask;
        public Task<bool> HasAnimalsAsync(int zoneId) => Task.FromResult(hasAnimals);
    }
}

using System.Linq;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using ZooAudioGuide.API.Controllers;
using ZooAudioGuide.API.DTOs;
using ZooAudioGuide.API.Filters;
using ZooAudioGuide.API.Models;
using ZooAudioGuide.API.Repositories;
using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.Tests;

[TestClass]
public sealed class AdminAccessTests
{
    private static IServiceProvider Services(string? user = "admin", string? pass = "s3cret") =>
        new ServiceCollection()
            .AddSingleton<IConfiguration>(new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?> { ["Admin:Username"] = user, ["Admin:Password"] = pass })
                .Build())
            .AddLogging()
            .AddDataProtection().Services
            .BuildServiceProvider();

    private static IActionResult? RunFilter(IServiceProvider services, string? authorization)
    {
        var http = new DefaultHttpContext { RequestServices = services };
        if (authorization != null) http.Request.Headers.Authorization = authorization;
        var ctx = new AuthorizationFilterContext(new ActionContext(http, new RouteData(), new ActionDescriptor()), []);
        new AdminKeyAttribute().OnAuthorization(ctx);
        return ctx.Result;
    }

    private static IActionResult Login(IServiceProvider services, string user, string pass)
    {
        var controller = new AuthController(services.GetRequiredService<IConfiguration>(), NullLogger<AuthController>.Instance)
        {
            ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { RequestServices = services } }
        };
        return controller.Login(new LoginRequestDto { Username = user, Password = pass });
    }

    [TestMethod]
    [DataRow(null, DisplayName = "Thiếu header")]
    [DataRow("Bearer abc!!", DisplayName = "Token rác")]
    [DataRow("Basic abc", DisplayName = "Sai kiểu header")]
    [DataRow("Bearer ", DisplayName = "Bearer rỗng")]
    public void Filter_RejectsMissingOrBadToken(string? authorization)
    {
        Assert.IsInstanceOfType<UnauthorizedObjectResult>(RunFilter(Services(), authorization));
    }

    [TestMethod]
    public void Filter_AcceptsValidToken_RejectsExpiredOne()
    {
        var services = Services();
        Assert.IsNull(RunFilter(services, "bearer " + AdminToken.Issue(services, "admin")));
        Assert.IsInstanceOfType<UnauthorizedObjectResult>(
            RunFilter(services, "Bearer " + AdminToken.Issue(services, "admin", TimeSpan.FromSeconds(-1))));
    }

    [TestMethod]
    public void Login_RightCredentials_GiveTokenThatPassesFilter()
    {
        var services = Services(user: "admin ", pass: "s3cret\n"); // giá trị Render dính khoảng trắng
        var ok = Login(services, "admin", "s3cret") as OkObjectResult;
        Assert.IsNotNull(ok);
        var token = (string)ok.Value!.GetType().GetProperty("token")!.GetValue(ok.Value)!;
        Assert.IsNull(RunFilter(services, "Bearer " + token));
    }

    [TestMethod]
    public void Login_WrongOrUnconfigured_Returns401()
    {
        Assert.IsInstanceOfType<UnauthorizedObjectResult>(Login(Services(), "admin", "wrong"));
        Assert.IsInstanceOfType<UnauthorizedObjectResult>(Login(Services(), "other", "s3cret"));
        Assert.IsInstanceOfType<UnauthorizedObjectResult>(Login(Services(user: null, pass: null), "", ""));
    }

    // Chặn trường hợp sau này thêm endpoint ghi mới mà quên gắn [AdminKey]
    [TestMethod]
    public void EveryWriteEndpoint_RequiresAdmin_ExceptScanLogsAndLogin()
    {
        var unprotected = typeof(AdminKeyAttribute).Assembly.GetTypes()
            .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract)
            .SelectMany(t => t.GetMethods().Select(m => (t, m)))
            .Where(x => x.m.GetCustomAttributes(true).Any(a => a is HttpPostAttribute or HttpPutAttribute or HttpDeleteAttribute))
            .Where(x => !x.m.IsDefined(typeof(AdminKeyAttribute), true) && !x.t.IsDefined(typeof(AdminKeyAttribute), true))
            .Select(x => $"{x.t.Name}.{x.m.Name}")
            .ToList();

        CollectionAssert.AreEquivalent(new[] { "ScanLogsController.CreateLog", "AuthController.Login" }, unprotected);
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

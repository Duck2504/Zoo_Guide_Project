using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.OutputCaching;
using System.Reflection;
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
    // Mỗi lần gọi là một provider mới, giống server vừa restart (không có khóa nào giữ lại trong bộ nhớ hay DataProtection)
    private static IServiceProvider Services(string? user = "admin", string? pass = "s3cret") =>
        new ServiceCollection()
            .AddSingleton<IConfiguration>(new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?> { ["Admin:Username"] = user, ["Admin:Password"] = pass })
                .Build())
            .AddLogging()
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
    public void Token_SurvivesRestart_ButNotPasswordChange()
    {
        var token = AdminToken.Issue(Services(), "admin");
        Assert.IsTrue(AdminToken.IsValid(Services(), token));                  // provider mới = server đã restart
        Assert.IsFalse(AdminToken.IsValid(Services(pass: "other"), token));    // đổi mật khẩu thì token cũ hết hiệu lực
    }

    [TestMethod]
    public void Token_TamperedOrExpired_IsRejected()
    {
        var services = Services();
        var token = AdminToken.Issue(services, "admin");
        var dot = token.IndexOf('.');
        // Sửa phần nội dung (kéo dài hạn) mà giữ chữ ký cũ
        var forged = System.Buffers.Text.Base64Url.EncodeToString(System.Text.Encoding.UTF8.GetBytes("admin|99999999999")) + token[dot..];
        Assert.IsFalse(AdminToken.IsValid(services, forged));
        Assert.IsFalse(AdminToken.IsValid(services, token[..^2] + (token[^2] == 'A' ? "BA" : "AA")));
        Assert.IsFalse(AdminToken.IsValid(services, token + ".x"));
        Assert.IsFalse(AdminToken.IsValid(services, AdminToken.Issue(services, "admin", TimeSpan.FromSeconds(-1))));
    }

    [TestMethod]
    public void Token_MissingSecret_FailsClosed()
    {
        var token = AdminToken.Issue(Services(), "admin");
        Assert.ThrowsExactly<InvalidOperationException>(() => AdminToken.Issue(Services(pass: null), "admin"));
        Assert.ThrowsExactly<InvalidOperationException>(() => AdminToken.Issue(Services(pass: "  "), "admin"));
        Assert.IsFalse(AdminToken.IsValid(Services(pass: null), token));
        Assert.IsFalse(AdminToken.IsValid(new ServiceCollection().BuildServiceProvider(), token)); // không có cả IConfiguration
    }

    [TestMethod]
    public void Login_RightCredentials_GiveTokenThatPassesFilter()
    {
        var services = Services(user: "admin ", pass: "s3cret\n"); // giá trị Render dính khoảng trắng
        var ok = Login(services, "admin", "s3cret") as OkObjectResult;
        Assert.IsNotNull(ok);
        var token = (string)ok.Value!.GetType().GetProperty("token")!.GetValue(ok.Value)!;
        Assert.IsNull(RunFilter(services, "Bearer " + token));
        Assert.IsNull(RunFilter(Services(user: "admin", pass: "s3cret"), "Bearer " + token)); // sau restart vẫn dùng được
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

    // OutputCache chạy trước filter [AdminKey]: cache nhầm API admin là lộ dữ liệu cho mọi người. Chỉ 5 API đọc công khai được cache.
    [TestMethod]
    public void OutputCache_OnlyOnPublicGets_WithSharedTag_AndAnimalsVaryByLang()
    {
        var types = typeof(AdminKeyAttribute).Assembly.GetTypes()
            .Where(t => typeof(ControllerBase).IsAssignableFrom(t) && !t.IsAbstract)
            .ToList();
        Assert.IsFalse(types.Any(t => t.IsDefined(typeof(OutputCacheAttribute), true)));
        var cached = types
            .SelectMany(t => t.GetMethods().Select(m => (t, m, a: m.GetCustomAttribute<OutputCacheAttribute>())))
            .Where(x => x.a != null)
            .ToList();

        CollectionAssert.AreEquivalent(
            new[] { "AnimalsController.GetAnimals", "AnimalsController.GetAnimal", "ZonesController.GetZones", "ZonesController.GetZone", "LanguagesController.GetLanguages" },
            cached.Select(x => $"{x.t.Name}.{x.m.Name}").ToArray());
        foreach (var (t, m, a) in cached)
        {
            Assert.IsFalse(m.IsDefined(typeof(AdminKeyAttribute), true) || t.IsDefined(typeof(AdminKeyAttribute), true), m.Name);
            Assert.IsTrue(m.IsDefined(typeof(HttpGetAttribute), true), m.Name);
            CollectionAssert.AreEqual(new[] { AnimalsController.CacheTag }, a!.Tags, m.Name);
            if (t == typeof(AnimalsController)) CollectionAssert.AreEqual(new[] { "lang" }, a.VaryByQueryKeys, m.Name); // ?lang=en và ?lang=vi là 2 bản cache
        }
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

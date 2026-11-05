using System.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace ZooAudioGuide.Tests;

[TestClass]
public sealed class NarrationClientTests
{
    private static NarrationClient Client(Func<HttpRequestMessage, HttpResponseMessage> handler, string? baseUrl = "https://x.ngrok-free.app/")
    {
        var cfg = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["NarrationService:BaseUrl"] = baseUrl,
            ["NarrationService:ApiKey"] = "k",
        }).Build();
        return new NarrationClient(new HttpClient(new Stub(handler)), cfg, NullLogger<NarrationClient>.Instance);
    }

    [TestMethod]
    public async Task Success_ParsesResults_AndSendsKey()
    {
        HttpRequestMessage? sent = null;
        var c = Client(r =>
        {
            sent = r;
            return new(HttpStatusCode.OK)
            {
                Content = new StringContent("""{"animalId":7,"results":[{"lang":"en","status":"DONE","translatedText":"Tiger","audioUrl":"u","error":null}]}""", System.Text.Encoding.UTF8, "application/json")
            };
        });

        var res = await c.GenerateAsync(7, "Hổ", ["en"]);

        Assert.AreEqual("https://x.ngrok-free.app/api/narration/generate", sent!.RequestUri!.ToString());
        Assert.AreEqual("k", sent.Headers.GetValues("X-Admin-Key").Single());
        Assert.AreEqual("DONE", res.Single().Status);
        Assert.AreEqual("Tiger", res.Single().TranslatedText);
    }

    [TestMethod]
    public async Task ErrorStatus_DownServer_OrNoConfig_AllFailed()
    {
        var bad = await Client(_ => new(HttpStatusCode.BadRequest) { Content = new StringContent("Chưa hỗ trợ: xx") }).GenerateAsync(1, "t", ["vi", "xx"]);
        var down = await Client(_ => throw new HttpRequestException("refused")).GenerateAsync(1, "t", ["vi"]);
        var none = await Client(_ => throw new InvalidOperationException("không được gọi"), baseUrl: null).GenerateAsync(1, "t", ["vi"]);
        var noScheme = await Client(_ => new(HttpStatusCode.OK), baseUrl: "abc.ngrok-free.app").GenerateAsync(1, "t", ["vi", "en"]);

        Assert.IsTrue(bad.All(r => r.Status == "FAILED") && bad.Length == 2);
        StringAssert.Contains(bad[0].Error, "Chưa hỗ trợ");
        Assert.AreEqual("FAILED", down.Single().Status);
        StringAssert.Contains(none.Single().Error, "BaseUrl");
        Assert.IsTrue(noScheme.All(r => r.Status == "FAILED"));
    }

    private sealed class Stub(Func<HttpRequestMessage, HttpResponseMessage> f) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage r, CancellationToken ct) => Task.FromResult(f(r));
    }
}

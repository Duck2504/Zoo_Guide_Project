using ZooAudioGuide.API.Services;

namespace ZooAudioGuide.Tests;

[TestClass]
public sealed class StatisticsWindowTests
{
    [TestMethod]
    public void Window_IsSevenVietnamDays_EndingToday()
    {
        // 18:30 UTC ngày 6/11 = 01:30 sáng 7/11 ở Việt Nam: "hôm nay" phải là 7/11
        var days = StatisticsService.WindowDates(new DateTime(2026, 11, 6, 18, 30, 0, DateTimeKind.Utc));

        Assert.HasCount(7, days);
        Assert.AreEqual(new DateTime(2026, 11, 7), days[^1]);
        Assert.AreEqual(new DateTime(2026, 11, 1), days[0]);
    }

    [TestMethod]
    public void FillDays_AddsZeroForDaysWithoutScans()
    {
        var days = StatisticsService.WindowDates(new DateTime(2026, 11, 7, 5, 0, 0, DateTimeKind.Utc));
        var filled = StatisticsService.FillDays(days, new Dictionary<DateTime, int> { [new DateTime(2026, 11, 5)] = 4 });

        Assert.HasCount(7, filled);
        Assert.AreEqual(4, filled.Single(d => d.Date == new DateTime(2026, 11, 5)).Count);
        Assert.AreEqual(4, filled.Sum(d => d.Count));
    }
}

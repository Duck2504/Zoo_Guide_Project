using System.ComponentModel.DataAnnotations;
using ZooAudioGuide.API.DTOs;

namespace ZooAudioGuide.Tests;

[TestClass]
public sealed class AnimalCreateDtoValidationTests
{
    private static bool Valid(AnimalCreateDto dto) =>
        Validator.TryValidateObject(dto, new ValidationContext(dto), [], validateAllProperties: true);

    [TestMethod]
    public void QuickFacts_NullOrKnownCodes_Accepted_UnknownRejected()
    {
        var baseDto = new AnimalCreateDto { ZoneId = 1, ScientificName = "Panthera tigris" };

        Assert.IsTrue(Valid(baseDto)); // admin lưu con vật chưa có thông tin nhanh
        Assert.IsTrue(Valid(new() { ZoneId = 1, ScientificName = "x", ConservationStatus = "EN", Diet = "carnivore", Habitat = "forest", LifespanYears = 15 }));
        Assert.IsFalse(Valid(new() { ZoneId = 1, ScientificName = "x", ConservationStatus = "XX" }));
        Assert.IsFalse(Valid(new() { ZoneId = 1, ScientificName = "x", Habitat = "moon" }));
        Assert.IsFalse(Valid(new() { ZoneId = 1, ScientificName = "x", LifespanYears = 0 }));
    }
}

using ZooAudioGuide.API.Controllers;

namespace ZooAudioGuide.Tests;

[TestClass]
public sealed class ImageTypeTests
{
    [TestMethod]
    public void ImageType_ReadsMagicBytes_NotTheFileName()
    {
        Assert.AreEqual("image/jpeg", AnimalsController.ImageType([0xFF, 0xD8, 0xFF, 0xE0]));
        Assert.AreEqual("image/png", AnimalsController.ImageType([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
        Assert.AreEqual("image/webp", AnimalsController.ImageType("RIFF\0\0\0\0WEBPVP8 "u8.ToArray()));

        Assert.IsNull(AnimalsController.ImageType("<svg onload=alert(1)>"u8.ToArray()));
        Assert.IsNull(AnimalsController.ImageType("GIF89a"u8.ToArray()));
        Assert.IsNull(AnimalsController.ImageType([]));
    }
}

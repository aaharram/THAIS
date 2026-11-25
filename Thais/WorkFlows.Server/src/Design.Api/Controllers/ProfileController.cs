using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Users;
using Design.Contract.Requests;

namespace Design.Api.Controllers;

[Route("api/profile")]
[ApiController]
[Authorize]
public class ProfileController(IUserService userService, IWebHostEnvironment env) : ControllerBase
{
    private static readonly HashSet<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    private string UploadRoot =>
        Path.Combine(env.ContentRootPath, "..", "Infrastructure", "Uploads", "profiles");

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("me")]
    public async Task<IActionResult> GetMeAsync()
    {
        try
        {
            return Ok(await userService.GetMyProfileAsync(CurrentUserId));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "User not found" });
        }
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateMeAsync([FromBody] MyProfileRequest request)
    {
        try
        {
            return Ok(await userService.UpdateMyProfileAsync(CurrentUserId, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "User not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("me/photo")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> UploadPhotoAsync(IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Format d'image non supporté." });
        }

        int userId = CurrentUserId;
        var dir = Path.Combine(UploadRoot, userId.ToString());
        Directory.CreateDirectory(dir);

        var uniqueName = $"{Guid.NewGuid()}{ext}";
        var physPath = Path.Combine(dir, uniqueName);
        await using (var fs = new FileStream(physPath, FileMode.Create))
        {
            await file.CopyToAsync(fs);
        }

        try
        {
            return Ok(await userService.UpdateProfilePictureAsync(userId, uniqueName));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "User not found" });
        }
    }

    [HttpGet("{id:int}/photo")]
    public async Task<IActionResult> GetPhotoAsync(int id)
    {
        var result = await userService.GetProfilePicturePhysicalPathAsync(id, UploadRoot);
        if (result is null) return NotFound();

        var (physPath, mimeType) = result.Value;
        if (!System.IO.File.Exists(physPath)) return NotFound();

        var bytes = await System.IO.File.ReadAllBytesAsync(physPath);
        return File(bytes, mimeType);
    }
}

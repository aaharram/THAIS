using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Users;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers;

[Route("api/members")]
[ApiController]
[Authorize]
public class UserController(IUserService userService, IWebHostEnvironment env) : ControllerBase
{
    private static readonly HashSet<string> AllowedSignatureExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    private string SignatureUploadRoot =>
        Path.Combine(env.ContentRootPath, "..", "Infrastructure", "Uploads", "signatures");

    [HttpPost("{id:int}/signature")]
    [Authorize(Roles = "Contractor")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> UploadSignatureAsync(int id, IFormFile file)
    {
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedSignatureExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Format d'image non supporté." });
        }

        var dir = Path.Combine(SignatureUploadRoot, id.ToString());
        Directory.CreateDirectory(dir);

        var uniqueName = $"{Guid.NewGuid()}{ext}";
        var physPath = Path.Combine(dir, uniqueName);
        await using (var fs = new FileStream(physPath, FileMode.Create))
        {
            await file.CopyToAsync(fs);
        }

        try
        {
            return Ok(await userService.UpdateSignatureAsync(id, uniqueName));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "User not found" });
        }
    }

    [HttpGet("{id:int}/signature")]
    [Authorize(Roles = "Contractor , Brancardier")]
    public async Task<IActionResult> GetSignatureAsync(int id)
    {
        var result = await userService.GetSignaturePhysicalPathAsync(id, SignatureUploadRoot);
        if (result is null) return NotFound();

        var (physPath, mimeType) = result.Value;
        if (!System.IO.File.Exists(physPath)) return NotFound();

        var bytes = await System.IO.File.ReadAllBytesAsync(physPath);
        return File(bytes, mimeType);
    }

    [HttpPost("unique-values")]
    public async Task<ActionResult<List<ColumnUniqueValuesResponse>>> GetUniqueValues(
        [FromBody] UniqueValuesRequest request)
    {
        try
        {
            List<ColumnUniqueValuesResponse> result = await userService.GetUniqueValuesAsync(request.ColumnNames);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [Authorize(Roles = "Contractor , Brancardier")]
    public async Task<IActionResult> GetAllMembersAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            PagedResult<object> members = await userService.GetAllMembersAsync(request);
            return Ok(members);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "An error occurred while retrieving members. {ex}", ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Contractor , Brancardier")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        try
        {
            UserResponse member = await userService.GetByIdAsync(id);
            return Ok(member);
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

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] UserRequest request)
    {
        try
        {
            UserResponse member = await userService.CreateAsync(request);
            return Ok(member);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] UserRequest request)
    {
        try
        {
            UserResponse member = await userService.UpdateAsync(id, request);
            return Ok(member);
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

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try
        {
            await userService.DeleteAsync(id);
            return NoContent();
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
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.PropertyManagement;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.PropertyManagement;

[Route("api/sinistres")]
[ApiController]
[Authorize]
public class SinistreController(ISinistreService sinistreService, IWebHostEnvironment env) : ControllerBase
{
    private static readonly HashSet<string> AttachmentKinds =
        new(StringComparer.OrdinalIgnoreCase) { "expertise-locataire", "expertise-bailleur", "pv-expertise" };

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx" };

    private string UploadRoot => Path.Combine(env.ContentRootPath, "..", "Infrastructure", "Uploads", "sinistres");

    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try { return Ok(await sinistreService.GetAllAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        try { return Ok(await sinistreService.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Sinistre not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] SinistreRequest request)
    {
        try { return Ok(await sinistreService.CreateAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] SinistreRequest request)
    {
        try { return Ok(await sinistreService.UpdateAsync(id, request)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Sinistre not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try { await sinistreService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Sinistre not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("{id:int}/attachment/{kind}")]
    [Authorize(Roles = "Contractor")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> UploadAttachmentAsync(int id, string kind, IFormFile file)
    {
        if (!AttachmentKinds.Contains(kind))
        {
            return BadRequest(new { message = "Type de pièce jointe invalide." });
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Format de fichier non supporté (pdf, jpg, png, doc, docx)." });
        }

        var dir = Path.Combine(UploadRoot, id.ToString());
        Directory.CreateDirectory(dir);

        // Préfixe GUID pour l'unicité sur disque, en gardant le nom d'origine lisible
        // (ce sont des documents métier que l'utilisateur doit pouvoir identifier).
        var baseName = Path.GetFileNameWithoutExtension(file.FileName);
        var uniqueName = $"{Guid.NewGuid():N}_{baseName}{ext}";
        var physPath = Path.Combine(dir, uniqueName);
        await using (var fs = new FileStream(physPath, FileMode.Create))
        {
            await file.CopyToAsync(fs);
        }

        try { return Ok(await sinistreService.UpdateAttachmentAsync(id, kind, uniqueName)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Sinistre not found" }); }
        catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}/attachment/{kind}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAttachmentAsync(int id, string kind)
    {
        if (!AttachmentKinds.Contains(kind))
        {
            return BadRequest(new { message = "Type de pièce jointe invalide." });
        }

        string? fileName = await sinistreService.GetAttachmentFileNameAsync(id, kind);
        if (string.IsNullOrEmpty(fileName))
        {
            return NotFound();
        }

        var physPath = Path.Combine(UploadRoot, id.ToString(), fileName);
        if (!System.IO.File.Exists(physPath))
        {
            return NotFound();
        }

        var bytes = await System.IO.File.ReadAllBytesAsync(physPath);
        return File(bytes, "application/octet-stream", fileName);
    }
}

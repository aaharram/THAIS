using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Design.Api.Controllers;

// Endpoint générique de pièces jointes, sur le même modèle que ProfileController (stockage
// physique sous Infrastructure/Uploads/{folder}, nom généré en GUID, lecture protégée par
// [Authorize]). Un "folder" par entité qui a un champ "Pieces jointe" - whitelisté pour
// éviter tout accès arbitraire au système de fichiers.
[Route("api/attachments")]
[ApiController]
[Authorize]
public class AttachmentsController(IWebHostEnvironment env) : ControllerBase
{
    private static readonly HashSet<string> AllowedFolders = ["avocats", "suivi-contentieux", "expertises", "actifs"];
    private static readonly HashSet<string> AllowedExtensions =
        [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".doc", ".docx", ".xls", ".xlsx"];

    private string RootFor(string folder) => Path.Combine(env.ContentRootPath, "Infrastructure", "Uploads", folder);

    [HttpPost("{folder}")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> UploadAsync(string folder, IFormFile file)
    {
        if (!AllowedFolders.Contains(folder))
        {
            return BadRequest(new { message = "Dossier non autorisé." });
        }

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
        {
            return BadRequest(new { message = "Format de fichier non supporté." });
        }

        var dir = RootFor(folder);
        Directory.CreateDirectory(dir);

        var uniqueName = $"{Guid.NewGuid()}{ext}";
        var physPath = Path.Combine(dir, uniqueName);
        await using (var fs = new FileStream(physPath, FileMode.Create))
        {
            await file.CopyToAsync(fs);
        }

        return Ok(new { fileName = uniqueName, originalName = file.FileName });
    }

    [HttpGet("{folder}/{fileName}")]
    public IActionResult Download(string folder, string fileName)
    {
        if (!AllowedFolders.Contains(folder) || Path.GetFileName(fileName) != fileName)
        {
            return NotFound();
        }

        var physPath = Path.Combine(RootFor(folder), fileName);
        if (!System.IO.File.Exists(physPath))
        {
            return NotFound();
        }

        return PhysicalFile(physPath, "application/octet-stream", fileName);
    }
}

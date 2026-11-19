using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers;

// Import Excel des listes de données de base : un point d'entrée par liste. Le fichier est lu côté
// client, ces routes reçoivent les lignes contrôlées (voir ImportService).
[Route("api/import")]
[ApiController]
[Authorize(Roles = "Contractor")]
public class ImportController(IImportService importService) : ControllerBase
{
    private async Task<IActionResult> ExecuterAsync(Func<Task<ImportResultResponse>> action)
    {
        try
        {
            return Ok(await action());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Échec de l'import : {ex.Message}" });
        }
    }

    [HttpPost("locaux")]
    public Task<IActionResult> LocauxAsync([FromBody] ImportRequest<LocalImportRow> request) =>
        ExecuterAsync(() => importService.ImportLocauxAsync(request));

    [HttpPost("actifs")]
    public Task<IActionResult> ActifsAsync([FromBody] ImportRequest<BuildingImportRow> request) =>
        ExecuterAsync(() => importService.ImportActifsAsync(request));

    [HttpPost("locataires")]
    public Task<IActionResult> LocatairesAsync([FromBody] ImportRequest<LocataireImportRow> request) =>
        ExecuterAsync(() => importService.ImportLocatairesAsync(request));

    [HttpPost("filiales")]
    public Task<IActionResult> FilialesAsync([FromBody] ImportRequest<FilialeImportRow> request) =>
        ExecuterAsync(() => importService.ImportFilialesAsync(request));

    [HttpPost("typologies-charge")]
    public Task<IActionResult> TypologiesChargeAsync([FromBody] ImportRequest<TypologieChargeImportRow> request) =>
        ExecuterAsync(() => importService.ImportTypologiesChargeAsync(request));

    // Listes de référence génériques : {module} = segment d'URL du module (villes, banques, building-types…).
    [HttpPost("reference/{module}")]
    public Task<IActionResult> ReferenceAsync(string module, [FromBody] ImportRequest<LookupImportRow> request) =>
        ExecuterAsync(() => importService.ImportLookupAsync(module, request));
}

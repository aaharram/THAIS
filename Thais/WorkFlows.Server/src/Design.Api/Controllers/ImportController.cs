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

    // Property Management
    [HttpPost("prestataires")]
    public Task<IActionResult> PrestatairesAsync([FromBody] ImportRequest<PrestataireImportRow> request) =>
        ExecuterAsync(() => importService.ImportPrestatairesAsync(request));

    [HttpPost("assurances")]
    public Task<IActionResult> AssurancesAsync([FromBody] ImportRequest<AssuranceImportRow> request) =>
        ExecuterAsync(() => importService.ImportAssurancesAsync(request));

    [HttpPost("charges")]
    public Task<IActionResult> ChargesAsync([FromBody] ImportRequest<ChargeImportRow> request) =>
        ExecuterAsync(() => importService.ImportChargesAsync(request));

    [HttpPost("taxes")]
    public Task<IActionResult> TaxesAsync([FromBody] ImportRequest<TaxeImportRow> request) =>
        ExecuterAsync(() => importService.ImportTaxesAsync(request));

    [HttpPost("membres-syndic")]
    public Task<IActionResult> MembresSyndicAsync([FromBody] ImportRequest<SyndicImportRow> request) =>
        ExecuterAsync(() => importService.ImportMembresSyndicAsync(request));

    [HttpPost("typologies-immobilisation")]
    public Task<IActionResult> TypologiesImmobilisationAsync([FromBody] ImportRequest<TypologieImmobilisationImportRow> request) =>
        ExecuterAsync(() => importService.ImportTypologiesImmobilisationAsync(request));

    [HttpPost("contrats-prestataires")]
    public Task<IActionResult> ContratsPrestatairesAsync([FromBody] ImportRequest<ContratPrestataireImportRow> request) =>
        ExecuterAsync(() => importService.ImportContratsPrestatairesAsync(request));

    [HttpPost("bons-commande")]
    public Task<IActionResult> BonsCommandeAsync([FromBody] ImportRequest<BonCommandeImportRow> request) =>
        ExecuterAsync(() => importService.ImportBonsCommandeAsync(request));

    [HttpPost("prestations-achat")]
    public Task<IActionResult> PrestationsAchatAsync([FromBody] ImportRequest<PrestationAchatImportRow> request) =>
        ExecuterAsync(() => importService.ImportPrestationsAchatAsync(request));

    [HttpPost("reclamations")]
    public Task<IActionResult> ReclamationsAsync([FromBody] ImportRequest<ReclamationImportRow> request) =>
        ExecuterAsync(() => importService.ImportReclamationsAsync(request));

    [HttpPost("sinistres")]
    public Task<IActionResult> SinistresAsync([FromBody] ImportRequest<SinistreImportRow> request) =>
        ExecuterAsync(() => importService.ImportSinistresAsync(request));

    // Listes de référence génériques : {module} = segment d'URL du module (villes, banques, building-types…).
    [HttpPost("reference/{module}")]
    public Task<IActionResult> ReferenceAsync(string module, [FromBody] ImportRequest<LookupImportRow> request) =>
        ExecuterAsync(() => importService.ImportLookupAsync(module, request));
}

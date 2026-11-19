using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Leasing;

[Route("api/paiements")]
[ApiController]
[Authorize]
public class PaiementController(IPaiementService paiementService) : ControllerBase
{
    [HttpGet("summary")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetSummaryAsync(
        [FromQuery] GetFilterSearchSortRequest request,
        [FromQuery] int noProprietaire = 0,
        [FromQuery] int noEncaisseur = 0)
    {
        try
        {
            PagedResult<object> result = await paiementService.GetSummaryAsync(request, noProprietaire, noEncaisseur);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync(
        [FromQuery] GetFilterSearchSortRequest request,
        [FromQuery] int noProprietaire = 0,
        [FromQuery] int noEncaisseur = 0,
        [FromQuery] int annee = 0,
        [FromQuery] int mois = 0,
        [FromQuery] string? statutAnnulation = null)
    {
        try
        {
            PagedResult<object> result = await paiementService.GetAllAsync(request, noProprietaire, noEncaisseur, annee, mois, statutAnnulation);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("total")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetTotalMontantAsync(
        [FromQuery] string? search = null,
        [FromQuery] int noProprietaire = 0,
        [FromQuery] int noEncaisseur = 0,
        [FromQuery] int annee = 0,
        [FromQuery] int mois = 0,
        [FromQuery] string? statutAnnulation = null)
    {
        try
        {
            decimal total = await paiementService.GetTotalMontantAsync(search, noProprietaire, noEncaisseur, annee, mois, statutAnnulation);
            return Ok(new { totalMontant = total });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("etat-rejet")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetEtatRejetAsync()
    {
        try
        {
            List<EtatRejetResponse> result = await paiementService.GetEtatRejetAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] PaiementRequest request)
    {
        try
        {
            PaiementResponse result = await paiementService.CreateAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{numero}/demander-annulation")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DemanderAnnulationAsync(int numero)
    {
        try
        {
            PaiementResponse result = await paiementService.DemanderAnnulationAsync(numero);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{numero}/rejeter-annulation")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> RejeterAnnulationAsync(int numero)
    {
        try
        {
            PaiementResponse result = await paiementService.RejeterAnnulationAsync(numero);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{numero}/confirmer-annulation")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> ConfirmerAnnulationAsync(int numero)
    {
        try
        {
            PaiementResponse result = await paiementService.ConfirmerAnnulationAsync(numero);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("importer-remise")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> ImporterRemiseAsync([FromBody] ImporterRemiseRequest request)
    {
        try
        {
            ImporterRemiseResponse result = await paiementService.ImporterRemiseAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("rapport-comptable")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GenererRapportComptableAsync(
        [FromQuery] int annee = 0,
        [FromQuery] int mois = 0,
        [FromQuery] int noProprietaire = 0)
    {
        try
        {
            RapportComptableResponse result = await paiementService.GenererRapportComptableAsync(annee, mois, noProprietaire);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

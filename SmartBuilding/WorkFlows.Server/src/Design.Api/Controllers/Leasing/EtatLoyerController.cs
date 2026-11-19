using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Leasing;

[Route("api/etat-loyers")]
[ApiController]
[Authorize]
public class EtatLoyerController(IEtatLoyerService service) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAsync([FromQuery] int annee, [FromQuery] int mois,
        [FromQuery] int? noBuilding, [FromQuery] int? noProprietaire)
    {
        try
        {
            EtatLoyerResponse result = await service.GetEtatLoyerAsync(annee, mois, noBuilding, noProprietaire);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("historique")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetHistoriqueAsync([FromQuery] int annee, [FromQuery] int mois,
        [FromQuery] int? noBuilding, [FromQuery] int? noProprietaire)
    {
        try
        {
            EtatLoyerResponse result = await service.GetHistoriqueAsync(annee, mois, noBuilding, noProprietaire);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("periodes-validees")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetPeriodesValideesAsync()
    {
        try
        {
            List<PeriodeValideeResponse> result = await service.GetPeriodesValideesAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("impayes-par-age")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetImpayesParAgeAsync([FromQuery] int? noProprietaire)
    {
        try
        {
            ImpayesParAgeResponse result = await service.GetImpayesParAgeAsync(noProprietaire);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("suivi-impaye")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetSuiviImpayeAsync([FromQuery] int? noProprietaire, [FromQuery] int? noEncaisseur)
    {
        try
        {
            List<SuiviImpayeLigneResponse> result = await service.GetSuiviImpayeAsync(noProprietaire, noEncaisseur);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("valider")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> ValiderAsync([FromBody] ValiderEtatLoyerRequest request)
    {
        try
        {
            EtatLoyerResponse result = await service.ValiderAsync(request);
            return Ok(result);
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
}

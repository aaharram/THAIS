using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Leasing;

[Route("api/rapports-recouvrement")]
[ApiController]
[Authorize]
public class RapportsRecouvrementController(IRapportsRecouvrementService service) : ControllerBase
{
    [HttpGet("etat-impaye")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetEtatImpayeAsync()
    {
        try
        {
            EtatImpayeResponse result = await service.GetEtatImpayeAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("apercu-emissions-encaissement")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetApercuEmissionsEncaissementAsync([FromQuery] int annee, [FromQuery] int mois)
    {
        try
        {
            ApercuEmissionsEncaissementResponse result =
                await service.GetApercuEmissionsEncaissementAsync(annee, mois);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("suivi-encaissement")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetSuiviEncaissementAsync(
        [FromQuery] int annee, [FromQuery] int mois, [FromQuery] int? noEncaisseur, [FromQuery] int? noBuilding)
    {
        try
        {
            SuiviEncaissementResponse result =
                await service.GetSuiviEncaissementAsync(annee, mois, noEncaisseur, noBuilding);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("rapport-encaisseur")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetRapportEncaisseurAsync([FromQuery] int annee, [FromQuery] int? noEncaisseur)
    {
        try
        {
            RapportEncaisseurResponse result = await service.GetRapportEncaisseurAsync(annee, noEncaisseur);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("prime-encaisseur")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetPrimeEncaisseurAsync([FromQuery] int annee, [FromQuery] int mois)
    {
        try
        {
            PrimeEncaisseurResponse result = await service.GetPrimeEncaisseurAsync(annee, mois);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Patrimoine;

[Route("api/etats-reglementaires")]
[ApiController]
[Authorize]
public class EtatReglementaireController(IEtatReglementaireService service) : ControllerBase
{
    [HttpGet("d21")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetD21Async()
    {
        try
        {
            EtatReglementaireResponse result = await service.GetD21Async();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("d05")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetD05Async()
    {
        try
        {
            EtatReglementaireResponse result = await service.GetD05Async();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Leasing;

[Route("api/journal-comptable")]
[ApiController]
[Authorize]
public class JournalComptableController(IJournalComptableService service) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetJournalAsync(
        [FromQuery] int annee, [FromQuery] int mois, [FromQuery] int? noProprietaire, [FromQuery] string typeJournal)
    {
        try
        {
            JournalComptableResponse result = await service.GetJournalAsync(annee, mois, noProprietaire, typeJournal);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("generer")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GenererAsync([FromBody] GenererJournalComptableRequest request)
    {
        try
        {
            JournalComptableResponse result = await service.GenererAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("historique")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetHistoriqueAsync()
    {
        try
        {
            List<JournalComptableGenerationResponse> result = await service.GetHistoriqueAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

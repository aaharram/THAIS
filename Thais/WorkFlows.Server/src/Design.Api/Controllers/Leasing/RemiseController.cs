using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;

namespace Design.Api.Controllers.Leasing;

[Route("api/remises")]
[ApiController]
[Authorize]
public class RemiseController(IRemiseService remiseService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync(
        [FromQuery] GetFilterSearchSortRequest request,
        [FromQuery] int statut = 0,
        [FromQuery] int annee = 0,
        [FromQuery] int mois = 0)
    {
        try { return Ok(await remiseService.GetAllAsync(request, statut, annee, mois)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("annees")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAnneesAsync()
    {
        try { return Ok(await remiseService.GetAnneesAsync()); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("mois")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetMoisAsync([FromQuery] int annee)
    {
        try { return Ok(await remiseService.GetMoisAsync(annee)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("annuler")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> AnnulerAsync([FromBody] RemiseIdsRequest request)
    {
        try { await remiseService.AnnulerAsync(request.Ids); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("supprimer")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> SupprimerAsync([FromBody] RemiseIdsRequest request)
    {
        try { await remiseService.SupprimerAsync(request.Ids); return NoContent(); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}

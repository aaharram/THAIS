using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.PropertyManagement;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.PropertyManagement;

[Route("api/prestations-achat")]
[ApiController]
[Authorize]
public class PrestationAchatController(IPrestationAchatService prestationAchatService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try { return Ok(await prestationAchatService.GetAllAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        try { return Ok(await prestationAchatService.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "PrestationAchat not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] PrestationAchatRequest request)
    {
        try { return Ok(await prestationAchatService.CreateAsync(request)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] PrestationAchatRequest request)
    {
        try { return Ok(await prestationAchatService.UpdateAsync(id, request)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "PrestationAchat not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    public record AmortirBody(int DureeMois, decimal? Taux);

    [HttpPost("{id:int}/amortir")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> AmortirAsync(int id, [FromBody] AmortirBody body)
    {
        try { return Ok(await prestationAchatService.AmortirAsync(id, body.DureeMois, body.Taux)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "PrestationAchat not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try { await prestationAchatService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new { message = "PrestationAchat not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}

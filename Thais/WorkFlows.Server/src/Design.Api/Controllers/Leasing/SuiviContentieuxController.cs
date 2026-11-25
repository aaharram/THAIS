using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;

namespace Design.Api.Controllers.Leasing;

[Route("api/suivi-contentieux")]
[ApiController]
[Authorize]
public class SuiviContentieuxController(ISuiviContentieuxService suiviContentieuxService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try { return Ok(await suiviContentieuxService.GetAllAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("etat-contentieux")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetEtatContentieuxAsync()
    {
        try { return Ok(await suiviContentieuxService.GetEtatContentieuxAsync()); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        try { return Ok(await suiviContentieuxService.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "SuiviContentieux not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] SuiviContentieuxRequest request)
    {
        try { return Ok(await suiviContentieuxService.CreateAsync(request)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] SuiviContentieuxRequest request)
    {
        try { return Ok(await suiviContentieuxService.UpdateAsync(id, request)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "SuiviContentieux not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try { await suiviContentieuxService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new { message = "SuiviContentieux not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}

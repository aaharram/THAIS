using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.PropertyManagement;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.PropertyManagement;

[Route("api/syndics")]
[ApiController]
[Authorize]
public class SyndicController(ISyndicService syndicService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try { return Ok(await syndicService.GetAllAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        try { return Ok(await syndicService.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Syndic not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] SyndicRequest request)
    {
        try { return Ok(await syndicService.CreateAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] SyndicRequest request)
    {
        try { return Ok(await syndicService.UpdateAsync(id, request)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Syndic not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try { await syndicService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Syndic not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}

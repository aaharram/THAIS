using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.PropertyManagement;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.PropertyManagement;

[Route("api/reclamations")]
[ApiController]
[Authorize]
public class ReclamationController(IReclamationService reclamationService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try { return Ok(await reclamationService.GetAllAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        try { return Ok(await reclamationService.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Reclamation not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] ReclamationRequest request)
    {
        try { return Ok(await reclamationService.CreateAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] ReclamationRequest request)
    {
        try { return Ok(await reclamationService.UpdateAsync(id, request)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Reclamation not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try { await reclamationService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Reclamation not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}

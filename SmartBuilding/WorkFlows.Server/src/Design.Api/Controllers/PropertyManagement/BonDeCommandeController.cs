using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.PropertyManagement;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.PropertyManagement;

[Route("api/bons-de-commande")]
[ApiController]
[Authorize]
public class BonDeCommandeController(IBonDeCommandeService bonDeCommandeService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try { return Ok(await bonDeCommandeService.GetAllAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        try { return Ok(await bonDeCommandeService.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "BonDeCommande not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] BonDeCommandeRequest request)
    {
        try { return Ok(await bonDeCommandeService.CreateAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("import")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> ImportAsync([FromBody] BonDeCommandeImportRequest request)
    {
        try { return Ok(await bonDeCommandeService.ImportAsync(request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] BonDeCommandeRequest request)
    {
        try { return Ok(await bonDeCommandeService.UpdateAsync(id, request)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "BonDeCommande not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try { await bonDeCommandeService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new { message = "BonDeCommande not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}

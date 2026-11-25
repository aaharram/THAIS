using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;

namespace Design.Api.Controllers.Leasing;

[Route("api/avocats")]
[ApiController]
[Authorize]
public class AvocatController(IAvocatService avocatService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] int noContentieux, [FromQuery] GetFilterSearchSortRequest request)
    {
        try { return Ok(await avocatService.GetAllAsync(noContentieux, request)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("counts")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetCountsAsync([FromQuery] List<int> noContentieuxList)
    {
        try { return Ok(await avocatService.GetCountsByContentieuxAsync(noContentieuxList)); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        try { return Ok(await avocatService.GetByIdAsync(id)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Avocat not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] AvocatRequest request)
    {
        try { return Ok(await avocatService.CreateAsync(request)); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] AvocatRequest request)
    {
        try { return Ok(await avocatService.UpdateAsync(id, request)); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Avocat not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try { await avocatService.DeleteAsync(id); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(new { message = "Avocat not found" }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}

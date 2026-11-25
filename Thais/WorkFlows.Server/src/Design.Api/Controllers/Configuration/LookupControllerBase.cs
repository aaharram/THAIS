using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Configuration;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Domain.Entities.Configuration;

namespace Design.Api.Controllers.Configuration;

[ApiController]
[Authorize]
public abstract class LookupControllerBase<T>(ILookupService<T> service) : ControllerBase
    where T : LookupEntity
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            return Ok(await service.GetAllAsync(request));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetByIdAsync(int id)
    {
        try
        {
            return Ok(await service.GetByIdAsync(id));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] LookupRequest request)
    {
        try
        {
            return Ok(await service.CreateAsync(request));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] LookupRequest request)
    {
        try
        {
            return Ok(await service.UpdateAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeleteAsync(int id)
    {
        try
        {
            await service.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

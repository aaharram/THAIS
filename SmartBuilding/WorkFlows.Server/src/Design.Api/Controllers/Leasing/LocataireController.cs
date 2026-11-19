using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Leasing;

[Route("api/locataires")]
[ApiController]
[Authorize]
public class LocataireController(ILocataireService locataireService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            PagedResult<object> result = await locataireService.GetAllAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("archives")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetArchivedAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            PagedResult<object> result = await locataireService.GetArchivedAsync(request);
            return Ok(result);
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
            LocataireResponse result = await locataireService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Locataire not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] LocataireRequest request)
    {
        try
        {
            LocataireResponse result = await locataireService.CreateAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] LocataireRequest request)
    {
        try
        {
            LocataireResponse result = await locataireService.UpdateAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Locataire not found" });
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
            await locataireService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Locataire not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/reactivate")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> ReactivateAsync(int id)
    {
        try
        {
            LocataireResponse result = await locataireService.ReactivateAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Locataire not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Leasing;

[Route("api/resiliations")]
[ApiController]
[Authorize]
public class ResiliationController(IResiliationService resiliationService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            PagedResult<object> result = await resiliationService.GetAllAsync(request);
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
            ResiliationResponse result = await resiliationService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Resiliation not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] ResiliationRequest request)
    {
        try
        {
            ResiliationResponse result = await resiliationService.CreateAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] ResiliationRequest request)
    {
        try
        {
            ResiliationResponse result = await resiliationService.UpdateAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Resiliation not found" });
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
            await resiliationService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Resiliation not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

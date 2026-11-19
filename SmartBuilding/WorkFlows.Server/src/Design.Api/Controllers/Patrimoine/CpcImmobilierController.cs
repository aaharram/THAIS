using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Patrimoine;

[Route("api/cpc-immobilier")]
[ApiController]
[Authorize]
public class CpcImmobilierController(ICpcImmobilierService service) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            PagedResult<object> result = await service.GetAllAsync(request);
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
            CpcImmobilierResponse result = await service.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "CpcImmobilier not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] CpcImmobilierRequest request)
    {
        try
        {
            CpcImmobilierResponse result = await service.CreateAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] CpcImmobilierRequest request)
    {
        try
        {
            CpcImmobilierResponse result = await service.UpdateAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "CpcImmobilier not found" });
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
            return NotFound(new { message = "CpcImmobilier not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Leasing;

[Route("api/attestations")]
[ApiController]
[Authorize]
public class AttestationController(IAttestationService attestationService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            PagedResult<object> result = await attestationService.GetAllAsync(request);
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
            AttestationResponse result = await attestationService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Attestation not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] AttestationRequest request)
    {
        try
        {
            AttestationResponse result = await attestationService.CreateAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] AttestationRequest request)
    {
        try
        {
            AttestationResponse result = await attestationService.UpdateAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Attestation not found" });
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
            await attestationService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Attestation not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Dashboard;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Dashboard;

[Route("api/dashboard")]
[ApiController]
[Authorize]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAsync(
        [FromQuery] int? noProprietaire,
        [FromQuery] int? noCity,
        [FromQuery] int? noLocalType,
        [FromQuery] int? noBuilding)
    {
        try
        {
            DashboardResponse result = await dashboardService.GetAsync(noProprietaire, noCity, noLocalType, noBuilding);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("actifs")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetActifsAsync(
        [FromQuery] int? noProprietaire,
        [FromQuery] int? noCity,
        [FromQuery] int? noLocalType)
    {
        try
        {
            List<LookupResponse> result = await dashboardService.GetActifsAsync(noProprietaire, noCity, noLocalType);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

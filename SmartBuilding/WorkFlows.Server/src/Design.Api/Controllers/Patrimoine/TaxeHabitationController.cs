using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Patrimoine;

[Route("api/taxe-habitation")]
[ApiController]
[Authorize]
public class TaxeHabitationController(ITaxeHabitationService service) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAsync([FromQuery] int? noProprietaire, [FromQuery] int? noBuilding)
    {
        try
        {
            List<TaxeHabitationBuildingResponse> result = await service.GetAsync(noProprietaire, noBuilding);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

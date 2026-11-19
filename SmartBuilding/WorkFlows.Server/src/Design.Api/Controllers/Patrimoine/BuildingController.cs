using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Patrimoine;

[Route("api/buildings")]
[ApiController]
[Authorize]
public class BuildingController(IBuildingService buildingService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            PagedResult<object> result = await buildingService.GetAllAsync(request);
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
            PagedResult<object> result = await buildingService.GetArchivedAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("map-markers")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetMapMarkersAsync([FromQuery] int? noProprietaire, [FromQuery] int? noBuildingType)
    {
        try
        {
            List<BuildingMapMarkerResponse> result = await buildingService.GetMapMarkersAsync(noProprietaire, noBuildingType);
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
            BuildingResponse result = await buildingService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Building not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] BuildingRequest request)
    {
        try
        {
            BuildingResponse result = await buildingService.CreateAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] BuildingRequest request)
    {
        try
        {
            BuildingResponse result = await buildingService.UpdateAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Building not found" });
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
            await buildingService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Building not found" });
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
            BuildingResponse result = await buildingService.ReactivateAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Building not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Documents libres d'un actif (bloc « Complètement Pièces jointes » de la fiche). Le fichier
    // est téléversé au préalable via POST api/attachments/actifs ; ces routes n'enregistrent
    // que la référence.
    [HttpGet("{id:int}/pieces-jointes")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetPiecesJointesAsync(int id)
    {
        try
        {
            return Ok(await buildingService.GetPiecesJointesAsync(id));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/pieces-jointes")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> AddPieceJointeAsync(int id, [FromBody] BuildingPieceJointeRequest request)
    {
        try
        {
            return Ok(await buildingService.AddPieceJointeAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Building not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}/pieces-jointes/{pieceJointeId:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DeletePieceJointeAsync(int id, int pieceJointeId)
    {
        try
        {
            int deleted = await buildingService.DeletePieceJointeAsync(id, pieceJointeId);
            return deleted == 0 ? NotFound(new { message = "Pièce jointe not found" }) : NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}/immobilisations-en-cours")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetImmobilisationsEnCoursAsync(int id)
    {
        try
        {
            return Ok(await buildingService.GetImmobilisationsEnCoursAsync(id));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Leasing;

[Route("api/baux")]
[ApiController]
[Authorize]
public class BailController(IBailService bailService) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            PagedResult<object> result = await bailService.GetAllAsync(request);
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
            PagedResult<object> result = await bailService.GetArchivedAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("nouveaux")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetNouveauxAsync([FromQuery] int? noProprietaire)
    {
        try
        {
            List<NouveauBailResponse> result = await bailService.GetNouveauxAsync(noProprietaire);
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
            BailResponse result = await bailService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Bail not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> CreateAsync([FromBody] BailRequest request)
    {
        try
        {
            BailResponse result = await bailService.CreateAsync(request);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Import Excel des baux : le fichier est lu côté client, seules les lignes validées arrivent ici.
    [HttpPost("import")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> ImportAsync([FromBody] BailImportRequest request)
    {
        try
        {
            BailImportResponse result = await bailService.ImportAsync(request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Échec de l'import : {ex.Message}" });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> UpdateAsync(int id, [FromBody] BailRequest request)
    {
        try
        {
            BailResponse result = await bailService.UpdateAsync(id, request);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Bail not found" });
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
            await bailService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Bail not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // Documents libres d'un bail (bloc « Pièces jointes » de la fiche). Le fichier est téléversé
    // au préalable via POST api/attachments/baux ; ces routes n'enregistrent que la référence.
    [HttpGet("{id:int}/pieces-jointes")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetPiecesJointesAsync(int id)
    {
        try
        {
            return Ok(await bailService.GetPiecesJointesAsync(id));
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/pieces-jointes")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> AddPieceJointeAsync(int id, [FromBody] BailPieceJointeRequest request)
    {
        try
        {
            return Ok(await bailService.AddPieceJointeAsync(id, request));
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Bail not found" });
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
            int deleted = await bailService.DeletePieceJointeAsync(id, pieceJointeId);
            return deleted == 0 ? NotFound(new { message = "Pièce jointe not found" }) : NoContent();
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
            BailResponse result = await bailService.ReactivateAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Bail not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

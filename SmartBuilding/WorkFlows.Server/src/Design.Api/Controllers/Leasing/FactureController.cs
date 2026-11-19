using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers.Leasing;

[Route("api/factures")]
[ApiController]
[Authorize]
public class FactureController(IFactureService factureService, IFacturePdfService facturePdfService) : ControllerBase
{
    [HttpGet("{id:int}/pdf")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetPdfAsync(int id)
    {
        try
        {
            byte[] pdf = await facturePdfService.GenererPdfAsync(id);
            return File(pdf, "application/pdf", $"Facture-{id}.pdf");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Facture not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GetAllAsync([FromQuery] GetFilterSearchSortRequest request)
    {
        try
        {
            PagedResult<object> result = await factureService.GetAllAsync(request);
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
            FactureResponse result = await factureService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Facture not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("generer")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> GenererAsync([FromBody] FactureRequest request)
    {
        try
        {
            FactureResponse result = await factureService.GenererAsync(request);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/marquer-edite")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> MarquerEditeAsync(int id)
    {
        try
        {
            FactureResponse result = await factureService.MarquerEditeAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Facture not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/demander-annulation")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> DemanderAnnulationAsync(int id)
    {
        try
        {
            FactureResponse result = await factureService.DemanderAnnulationAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Facture not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/confirmer-annulation")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> ConfirmerAnnulationAsync(int id)
    {
        try
        {
            FactureResponse result = await factureService.ConfirmerAnnulationAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Facture not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/annuler-demande-annulation")]
    [Authorize(Roles = "Contractor")]
    public async Task<IActionResult> AnnulerDemandeAnnulationAsync(int id)
    {
        try
        {
            FactureResponse result = await factureService.AnnulerDemandeAnnulationAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Facture not found" });
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
            await factureService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Facture not found" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

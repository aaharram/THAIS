using Microsoft.AspNetCore.Mvc;
using Design.Application.Interfaces.Users;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Api.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController(IAuthService authService) : ControllerBase
{

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] AuthRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            AuthResponse result = await authService.LoginAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Password reset required.")
        {
            return BadRequest(new { requiresPasswordReset = true });
        }
    }

    [HttpPost("force-login")]
    public async Task<IActionResult> ForceLogin(
        [FromBody] AuthRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            AuthResponse result = await authService.ForceLoginAsync(request, cancellationToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpPost("first-reset-password")]
    public async Task<IActionResult> FirstResetPassword(
        [FromBody] FirstResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await authService.FirstResetPasswordAsync(request, cancellationToken);
            return Ok(new { message = "Le mot de passe a été réinitialisé avec succès." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await authService.LogoutAsync(request.UserName, cancellationToken);
            return Ok(new { message = "Logged out successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpPost("forgetPassword")]
    public async Task<IActionResult> ForgetPassword(
        [FromBody] ForgetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await authService.ForgetPasswordAsync(request, cancellationToken);
            return Ok(new { message = "Password reset instructions sent." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("resetPassword")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await authService.ResetPasswordAsync(request, cancellationToken);
            return Ok(new { message = "Password has been reset successfully." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}

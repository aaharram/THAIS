using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace Design.Api.Middleware;

public class ValidateTokenMiddleware(
    RequestDelegate next,
    ILogger<ValidateTokenMiddleware> logger,
    IConfiguration configuration)
{
    private readonly string _jwtSecret = configuration["Jwt:Key"]
                                         ?? throw new ArgumentNullException("Jwt:Key is missing in configuration");

    public async Task InvokeAsync(HttpContext context)
    {
        string? path = context.Request.Path.Value;
        
        if (path != null && (path.Contains("/auth") || path.Contains("/hub")))
        {
            await next(context);
            return;
        }
        
        string? token = context.Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");

        if (string.IsNullOrEmpty(token))
        {
            token = context.Request.Query["access_token"].FirstOrDefault();
        }

        if (string.IsNullOrEmpty(token))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Unauthorized: Token is missing");
            return;
        }

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            byte[] key = Encoding.UTF8.GetBytes(_jwtSecret);

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            var jwtToken = (JwtSecurityToken)validatedToken;
            var claimsIdentity = new ClaimsIdentity(jwtToken.Claims, "jwt");

            context.User = new ClaimsPrincipal(claimsIdentity);
        }
        catch (SecurityTokenException ex)
        {
            logger.LogWarning(ex, "Invalid token");
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsync("Unauthorized: Invalid token");
            return;
        }

        await next(context);
    }
}

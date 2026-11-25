using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Design.Application.Interfaces.Users;
using Design.Domain.Entities.Users;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Users;

public class TokenService(IConfiguration configuration, DbDesignContext context) : ITokenService
{
    public async Task<string> GenerateToken(User user, CancellationToken cancellationToken = default)
    {
        string roleTitle = await AccessRoleResolver.ResolveAsync(context, user.PatrimoineType, cancellationToken);

        // Create minimal claims set
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Numero.ToString()),
            new(ClaimTypes.NameIdentifier, user.Numero.ToString()),
            new(ClaimTypes.Role, roleTitle)
        };

        if (!string.IsNullOrWhiteSpace(user.Username))
        {
            claims.Add(new Claim(ClaimTypes.Name, user.Username.Trim()));
        }

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            claims.Add(new Claim(ClaimTypes.Email, user.Email.Trim()));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ??
                                                                  throw new InvalidOperationException(
                                                                      "JWT Key is not configured")));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            configuration["Jwt:Issuer"],
            configuration["Jwt:Audience"],
            claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        string tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        user.Refreshtoken = tokenString;
        user.Refreshtokenexp = token.ValidTo;
        user.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return tokenString;
    }
}

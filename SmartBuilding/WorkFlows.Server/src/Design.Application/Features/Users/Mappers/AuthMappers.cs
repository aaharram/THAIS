using Design.Contract.Responses;
using Design.Domain.Entities.Users;

namespace Design.Application.Features.Users.Mappers;

public static class AuthMappers
{
    public static AuthResponse ToAuthResponse(this User user, string roleTitle, string token)
    {
        return new AuthResponse
        {
            Name = user.Name,
            Email = user.Email,
            Role = roleTitle,
            Id = user.Numero,
            Token = token
        };
    }
}

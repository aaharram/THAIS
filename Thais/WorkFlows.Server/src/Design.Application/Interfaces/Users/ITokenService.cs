using Design.Domain.Entities.Users;

namespace Design.Application.Interfaces.Users;

public interface ITokenService
{
    Task<string> GenerateToken(User user, CancellationToken cancellationToken = default);
}

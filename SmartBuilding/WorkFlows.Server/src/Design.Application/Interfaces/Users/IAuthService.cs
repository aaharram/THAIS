using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Users;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(AuthRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse> ForceLoginAsync(AuthRequest request, CancellationToken cancellationToken = default);
    Task FirstResetPasswordAsync(FirstResetPasswordRequest request, CancellationToken cancellationToken = default);
    Task LogoutAsync(string userName, CancellationToken cancellationToken = default);
    Task ForgetPasswordAsync(ForgetPasswordRequest request, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
}

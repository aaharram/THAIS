using System.DirectoryServices.Protocols;
using System.Net;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Design.Application.Features.Users.Mappers;
using Design.Application.Interfaces.Users;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Users;
using Design.Domain.Entities.Users.Enums;
using Design.Infrastructure.Data;
using Design.Infrastructure.Interfaces;
using Task = System.Threading.Tasks.Task;

namespace Design.Application.Features.Users;

public class AuthService(
    IUserRepository userRepository,
    IUserService userService,
    DbDesignContext context,
    ILogger<IAuthService> logger,
    ITokenService tokenService,
    IMapper mapper,
    IConfiguration configuration) : IAuthService
{
    // Get LDAP configuration

    private readonly int LdapPort = configuration.GetValue<int>("LDAP:ldapPort");
    private readonly string? LdapHost = configuration.GetValue<string>("LDAP:ldapHost");
    private readonly string? SearchBase = configuration.GetValue<string>("LDAP:searchBase");
    private readonly string? LdapUsername = configuration.GetValue<string>("LDAP:bindDn");
    private readonly string? LdapPassword = configuration.GetValue<string>("LDAP:bindPassword");
    private readonly string? SSL = configuration.GetValue<string>("LDAP:SSL");
    private readonly string? UsesLDAP = configuration.GetValue<string>("LDAP:UsesLDAP");

    private async Task<UserRequest?> AuthenticateWithLdapAsync(string username, string password)
    {
        logger.LogInformation("Attempting LDAP authentication for user: {Username}", username);

        try
        {
            using LdapConnection ldapConnection = CreateLdapConnection();
            ldapConnection.Bind(new NetworkCredential(LdapUsername, LdapPassword));

            var searchRequest = new SearchRequest(
                SearchBase,
                $"(sAMAccountName={username})",
                SearchScope.Subtree, "dn", "sn", "userPrincipalName", "givenName", "mail", "memberOf");

            var searchResponse = (SearchResponse)ldapConnection.SendRequest(searchRequest);
            if (searchResponse.Entries.Count == 0)
            {
                logger.LogWarning("No LDAP user found with sAMAccountName: {Username}", username);
                return null;
            }

            SearchResultEntry? entry = searchResponse.Entries[0];
            string? userDn = entry.DistinguishedName;

            // Validate user password by rebinding with user credentials
            using LdapConnection userLdapConnection = CreateLdapConnection();
            userLdapConnection.Bind(new NetworkCredential(username, password));
            logger.LogInformation("LDAP authentication successful for {Username}", username);

            return new UserRequest
            {
                FirstName = entry.Attributes["givenName"]?[0]?.ToString(),
                LastName = entry.Attributes["sn"]?[0]?.ToString(),
                Email = entry.Attributes["mail"]?[0]?.ToString(),
                Username = username,
                Enabled = true,
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during LDAP authentication for user: {Username}", username);
            return null;
        }
    }

    private LdapConnection CreateLdapConnection()
    {
        var identifier = new LdapDirectoryIdentifier(LdapHost, LdapPort);
        var connection = new LdapConnection(identifier)
        {
            SessionOptions =
            {
                ProtocolVersion = 3,
                SecureSocketLayer = SSL?.Equals("true", StringComparison.OrdinalIgnoreCase) == true
            }
        };
        return connection;
    }

    public async Task<AuthResponse> LoginAsync(AuthRequest request, CancellationToken cancellationToken = default)
    {
        User? member;
        string roleTitle;
        string token;

        if (request.isLdap)
        {
            UserRequest ldapUser = await AuthenticateWithLdapAsync(request.Username!, request.Password!)
                                   ?? throw new UnauthorizedAccessException("Code utilisateur non valide.");

            member = await userRepository.GetByUsernameAsync(ldapUser.Username!, cancellationToken);

            if (member == null)
            {
                UserResponse createdUser = await userService.CreateAsync(ldapUser);
                member = await userRepository.GetByUsernameAsync(createdUser.Username!, cancellationToken);
            }
        }
        else
        {
            member = await userRepository.GetByUsernameAsync(request.Username!, cancellationToken)
                     ?? throw new UnauthorizedAccessException("Code utilisateur non valide.");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, member.Password))
            {
                throw new UnauthorizedAccessException("Mot de passe non valide.");
            }

            if (member.NeedPasswordReset == 1)
            {
                throw new InvalidOperationException("Password reset required.");
            }
        }

        // Common post-login logic
        token = await tokenService.GenerateToken(member!, cancellationToken);
        roleTitle = await AccessRoleResolver.ResolveAsync(context, member.PatrimoineType, cancellationToken);

        await UpdateUserStatusAsync(member!, cancellationToken);

        return member.ToAuthResponse(roleTitle, token);
    }

    private async Task UpdateUserStatusAsync(User user, CancellationToken cancellationToken)
    {
        if (user is null)
        {
            throw new ArgumentNullException(nameof(user));
        }

        user.LastLogin = DateTime.UtcNow;
        user.Statut = PorterStatus.AVAILABLE;

        await userRepository.UpdateAsync(user, cancellationToken).ConfigureAwait(false);
    }

    public async Task<AuthResponse> ForceLoginAsync(AuthRequest request, CancellationToken cancellationToken = default)
    {
        User? member = await userRepository.GetByUsernameAsync(request.Username!, cancellationToken);

        if (member == null)
        {
            throw new UnauthorizedAccessException("Code utilisateur non valide.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, member.Password))
        {
            throw new UnauthorizedAccessException("Mot de pass non valide.");
        }

        if (member.NeedPasswordReset == 1)
        {
            throw new InvalidOperationException("Réinitialisation du mot de passe requise.");
        }

        member.LastLogin = DateTime.UtcNow;

        string token = await tokenService.GenerateToken(member, cancellationToken);
        string roleTitle = await AccessRoleResolver.ResolveAsync(context, member.PatrimoineType, cancellationToken);

        await userRepository.UpdateAsync(member, cancellationToken);
        return member.ToAuthResponse(roleTitle, token);
    }

    public async Task FirstResetPasswordAsync(FirstResetPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        User? member = await userRepository.GetByUsernameAsync(request.Username, cancellationToken);
        if (member == null)
        {
            throw new UnauthorizedAccessException("Code utilisateur non valide.");
        }

        string temporaryPassword = $"{member.FirstName.Trim()}{member.LastName.Trim()}".ToLower();
        if (!BCrypt.Net.BCrypt.Verify(temporaryPassword, member.Password))
        {
            throw new UnauthorizedAccessException("État du mot de passe temporaire non valide.");
        }

        member.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        member.NeedPasswordReset = 0;
        member.ModDate = DateTime.UtcNow;
        await userRepository.UpdateAsync(member, cancellationToken);
    }

    public async Task LogoutAsync(string userName, CancellationToken cancellationToken = default)
    {
        User? member = await userRepository.GetByEmailAsync(userName, cancellationToken);
        if (member == null)
        {
            throw new UnauthorizedAccessException("Invalid logout attempt.");
        }

        member.LastHit = DateTime.UtcNow;
        member.Statut = PorterStatus.NOT_AVAILABLE;

        await userRepository.UpdateAsync(member, cancellationToken);
    }

    public async Task ForgetPasswordAsync(ForgetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        User? member = await userRepository.GetByEmailAsync(request.Email!, cancellationToken);
        if (member == null)
        {
            throw new KeyNotFoundException("Email address not found.");
        }

        // In production: Generate and send password reset token
        string resetToken = Guid.NewGuid().ToString();
        //await SendPasswordResetEmail(member.Email, resetToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        User? member = await userRepository.GetByUsernameAsync(request.Username!, cancellationToken);
        if (member == null)
        {
            throw new UnauthorizedAccessException("Invalid Username.");
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, member.Password))
        {
            throw new UnauthorizedAccessException("Invalid Current Password.");
        }

        member.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await userRepository.UpdateAsync(member, cancellationToken);
    }
}

using Microsoft.EntityFrameworkCore;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Users;

// Dérive le niveau d'accès (utilisé pour le claim d'autorisation ASP.NET) à partir du
// Profil (ServiceProfil) de l'utilisateur, plutôt que d'un Rôle dédié qui n'existe pas
// dans RMANew — un Profil marqué "Accès complet" donne les droits Contractor.
public static class AccessRoleResolver
{
    public const string FullAccessRole = "Contractor";
    public const string RestrictedAccessRole = "Brancardier";

    public static async Task<string> ResolveAsync(
        DbDesignContext context,
        int? patrimoineType,
        CancellationToken cancellationToken = default)
    {
        if (patrimoineType is null)
        {
            return RestrictedAccessRole;
        }

        bool accesComplet = await context.ServiceProfils
            .Where(sp => sp.Numero == patrimoineType)
            .Select(sp => sp.AccesComplet)
            .FirstOrDefaultAsync(cancellationToken);

        return accesComplet ? FullAccessRole : RestrictedAccessRole;
    }
}

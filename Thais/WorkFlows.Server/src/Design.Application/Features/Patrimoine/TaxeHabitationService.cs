using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Patrimoine;

public class TaxeHabitationService(DbDesignContext context, ILogger<TaxeHabitationService> logger) : ITaxeHabitationService
{
    // RMANew (TaxeHabitation.vb, GenerateTable) : baux actifs générant quittance
    // (GenererQuittance=1, EtatLocation=1, inactif=0), groupés par actif, avec le loyer
    // net annualisé (LoyerNet * 12) comme base de la taxe d'habitation.
    public async Task<List<TaxeHabitationBuildingResponse>> GetAsync(int? noProprietaire, int? noBuilding)
    {
        IQueryable<Building> buildingsQuery = context.Buildings.Where(b => !b.Inactif);

        if (noBuilding is > 0)
        {
            buildingsQuery = buildingsQuery.Where(b => b.Numero == noBuilding);
        }
        else if (noProprietaire is > 0)
        {
            buildingsQuery = buildingsQuery.Where(b => b.NoProprietaire == noProprietaire);
        }

        List<Building> buildings = await buildingsQuery.OrderBy(b => b.Designation).ToListAsync();
        var buildingIds = buildings.Select(b => b.Numero).ToList();

        List<Bail> baux = await context.Baux
            .Where(b => !b.Inactif && b.Etat == "En cours de location" && b.GenererQuittance && buildingIds.Contains(b.NoBuilding))
            .ToListAsync();

        var cityIds = buildings.Where(b => b.NoCity != null).Select(b => b.NoCity!.Value).Distinct().ToList();
        Dictionary<int, string> villes = await context.Villes
            .Where(v => cityIds.Contains(v.Numero))
            .ToDictionaryAsync(v => v.Numero, v => v.Designation);

        var localIds = baux.Select(b => b.NoLocal).Distinct().ToList();
        Dictionary<int, Local> locaux = await context.Locaux
            .Where(l => localIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        var locataireIds = baux.Select(b => b.NoLocataire).Distinct().ToList();
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(l => locataireIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        var bauxParBuilding = baux.GroupBy(b => b.NoBuilding).ToDictionary(g => g.Key, g => g.ToList());

        var result = new List<TaxeHabitationBuildingResponse>();
        foreach (Building building in buildings)
        {
            if (!bauxParBuilding.TryGetValue(building.Numero, out List<Bail>? bauxDeLImmeuble) || bauxDeLImmeuble.Count == 0)
            {
                continue;
            }

            string? ville = building.NoCity != null && villes.TryGetValue(building.NoCity.Value, out string? v) ? v : null;

            List<TaxeHabitationLigneResponse> lignes = bauxDeLImmeuble.Select(b =>
            {
                locaux.TryGetValue(b.NoLocal, out Local? local);
                locataires.TryGetValue(b.NoLocataire, out Locataire? locataire);

                string? nomLocataire = locataire == null
                    ? null
                    : locataire.TypeLocataire == 1
                        ? locataire.DesignationEntreprise
                        : $"{locataire.Nom} {locataire.Prenom}".Trim();

                return new TaxeHabitationLigneResponse
                {
                    Article = building.NoArticle,
                    Ville = ville,
                    NomLocataire = nomLocataire,
                    Etage = local?.Etage,
                    NomLocal = local?.Designation,
                    Superficie = local?.Surface,
                    Usage = b.Usage,
                    LoyerNetAnnuel = (b.LoyerNet ?? 0) * 12
                };
            }).ToList();

            result.Add(new TaxeHabitationBuildingResponse
            {
                NoBuilding = building.Numero,
                NomBuilding = building.Designation,
                CodeImmeuble = building.CodeImmeuble,
                TotalActif = lignes.Sum(l => l.LoyerNetAnnuel),
                Lignes = lignes
            });
        }

        logger.LogInformation("Computed Taxe d'Habitation for {Count} buildings.", result.Count);

        return result;
    }
}

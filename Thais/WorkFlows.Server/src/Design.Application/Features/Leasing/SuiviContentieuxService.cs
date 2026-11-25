using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Leasing;

// RMANew (ListSuiviJuridique.aspx) : suivi des dossiers de contentieux locatif, un
// enregistrement par bail placé en contentieux.
public class SuiviContentieuxService(DbDesignContext context, ILogger<SuiviContentieuxService> logger) : ISuiviContentieuxService
{
    private static readonly string[] EtatsImpayes = ["Impayée", "Partiellement payée"];

    private async Task<decimal> GetMontantImpayeAsync(int? noLocation)
    {
        if (noLocation is null) return 0;

        return await context.Factures
            .Where(f => f.NoLocation == noLocation && EtatsImpayes.Contains(f.Etat))
            .SumAsync(f => f.Montant);
    }

    // RMANew (ViewReporting.vb, ExportEtatContentieux) : baux en contentieux, avec le
    // solde de l'année précédente (SuiviContentieux.SoldeAnneePrecedente, saisi à la
    // main), les émissions/règlements de l'année en cours et le solde actuel (impayé
    // vivant, recalculé - RMANew lit Location.LoyersImpayes, un champ dénormalisé absent
    // ici, voir GetMontantImpayeAsync). "Réglements" exclut les paiements annulés/rejetés
    // (Paiement.Annule/Rejete) - RMANew ne le fait pas dans sa requête SQL brute, mais
    // compter un encaissement rejeté comme "réglé" serait faux pour un rapport dont le
    // but est justement de suivre les impayés en contentieux.
    public async Task<List<EtatContentieuxResponse>> GetEtatContentieuxAsync()
    {
        int anneeCourante = DateTime.UtcNow.Year;

        List<SuiviContentieux> dossiers = await context.SuivisContentieux
            .Where(s => s.StatutDossier == "En Contentieux" && s.NoLocation != null)
            .ToListAsync();

        var bailIds = dossiers.Select(d => d.NoLocation!.Value).Distinct().ToList();
        Dictionary<int, Bail> baux = await context.Baux
            .Where(b => bailIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        var buildingIds = baux.Values.Select(b => b.NoBuilding).Distinct().ToList();
        Dictionary<int, Building> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        var cityIds = buildings.Values.Where(b => b.NoCity != null).Select(b => b.NoCity!.Value).Distinct().ToList();
        Dictionary<int, string> villes = await context.Villes
            .Where(v => cityIds.Contains(v.Numero))
            .ToDictionaryAsync(v => v.Numero, v => v.Designation);

        var locataireIds = baux.Values.Select(b => b.NoLocataire).Distinct().ToList();
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(l => locataireIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        Dictionary<int, decimal> emissionsParBail = (await context.Factures
                .Where(f => bailIds.Contains(f.NoLocation) && f.DateEcheance != null && f.DateEcheance!.Value.Year == anneeCourante)
                .ToListAsync())
            .GroupBy(f => f.NoLocation)
            .ToDictionary(g => g.Key, g => g.Sum(f => f.Montant));

        Dictionary<int, decimal> reglementsParBail = (await context.Paiements
                .Where(p => bailIds.Contains(p.NoLocation) && !p.Annule && !p.Rejete && p.DatePaiement.Year == anneeCourante)
                .ToListAsync())
            .GroupBy(p => p.NoLocation)
            .ToDictionary(g => g.Key, g => g.Sum(p => p.Montant));

        var result = new List<EtatContentieuxResponse>();
        foreach (SuiviContentieux dossier in dossiers)
        {
            int noLocation = dossier.NoLocation!.Value;
            baux.TryGetValue(noLocation, out Bail? bail);
            Building? building = bail != null && buildings.TryGetValue(bail.NoBuilding, out Building? bd) ? bd : null;
            Locataire? locataire = bail != null && locataires.TryGetValue(bail.NoLocataire, out Locataire? loc) ? loc : null;

            string? nomLocataire = locataire == null
                ? null
                : locataire.TypeLocataire == 1
                    ? locataire.DesignationEntreprise
                    : $"{locataire.Nom} {locataire.Prenom}".Trim();
            string? ville = building?.NoCity != null && villes.TryGetValue(building.NoCity.Value, out string? v) ? v : null;
            bool enCours = bail?.Etat == "En cours de location";
            decimal montantImpaye = await GetMontantImpayeAsync(noLocation);

            result.Add(new EtatContentieuxResponse
            {
                DateDebutContentieux = dossier.DateDebutContentieux,
                NomLocataire = nomLocataire,
                NomBuilding = building?.Designation,
                Ville = ville,
                CompteGeneral = building?.CompteGeneral,
                NumContratLocations = bail?.NumContratLocations,
                EnCours = enCours,
                DateResiliation = enCours ? null : bail?.DateFin,
                LoyerMensuel = bail?.Montant,
                SoldeAnneePrecedente = dossier.SoldeAnneePrecedente,
                EmissionsAnneeCourante = emissionsParBail.GetValueOrDefault(noLocation),
                ReglementsAnneeCourante = reglementsParBail.GetValueOrDefault(noLocation),
                SoldeActuel = montantImpaye
            });
        }

        logger.LogInformation("Computed Etat de contentieux for {Count} dossiers.", result.Count);

        return result;
    }

    private static SuiviContentieuxResponse ToResponse(
        SuiviContentieux entity, string? numContrat, string? nomLocataire, string? nomBuilding, string? ville, decimal montantImpaye, int avocatCount) => new()
    {
        Numero = entity.Numero,
        NoLocation = entity.NoLocation,
        NumContratLocations = numContrat,
        NomLocataire = nomLocataire,
        NomBuilding = nomBuilding,
        Ville = ville,
        NatureProcedure = entity.NatureProcedure,
        Observation = entity.Observation,
        Description = entity.Description,
        StatutDossier = entity.StatutDossier,
        DateDebutContentieux = entity.DateDebutContentieux,
        DateEncaissement = entity.DateEncaissement,
        MontantEncaisse = entity.MontantEncaisse,
        SoldeAnneePrecedente = entity.SoldeAnneePrecedente,
        PieceJointe = entity.PieceJointe,
        MontantImpaye = montantImpaye,
        AvocatCount = avocatCount,
        AddUser = entity.AddUser,
        AddDate = entity.AddDate
    };

    private async Task<SuiviContentieuxResponse> ToResponseAsync(SuiviContentieux entity)
    {
        Bail? bail = entity.NoLocation is null ? null : await context.Baux.FindAsync(entity.NoLocation.Value);
        string? nomBuilding = null, ville = null, nomLocataire = null;

        if (bail != null)
        {
            Building? building = await context.Buildings.FindAsync(bail.NoBuilding);
            nomBuilding = building?.Designation;
            if (building?.NoCity != null)
            {
                ville = await context.Villes.Where(x => x.Numero == building.NoCity).Select(x => x.Designation).FirstOrDefaultAsync();
            }

            Locataire? locataire = await context.Locataires.FindAsync(bail.NoLocataire);
            if (locataire != null)
            {
                nomLocataire = locataire.TypeLocataire == 1 ? locataire.DesignationEntreprise : $"{locataire.Nom} {locataire.Prenom}".Trim();
            }
        }

        decimal montantImpaye = await GetMontantImpayeAsync(entity.NoLocation);
        int avocatCount = await context.Avocats.CountAsync(a => a.NoContentieux == entity.Numero);

        return ToResponse(entity, bail?.NumContratLocations, nomLocataire, nomBuilding, ville, montantImpaye, avocatCount);
    }

    private async Task<List<SuiviContentieuxResponse>> ToResponseListAsync(List<SuiviContentieux> items)
    {
        var locationIds = items.Where(x => x.NoLocation != null).Select(x => x.NoLocation!.Value).Distinct().ToList();
        Dictionary<int, Bail> baux = await context.Baux.Where(b => locationIds.Contains(b.Numero)).ToDictionaryAsync(b => b.Numero);

        var buildingIds = baux.Values.Select(b => b.NoBuilding).Distinct().ToList();
        var locataireIds = baux.Values.Select(b => b.NoLocataire).Distinct().ToList();
        Dictionary<int, Building> buildings = await context.Buildings.Where(b => buildingIds.Contains(b.Numero)).ToDictionaryAsync(b => b.Numero);
        Dictionary<int, Locataire> locataires = await context.Locataires.Where(l => locataireIds.Contains(l.Numero)).ToDictionaryAsync(l => l.Numero);

        var cityIds = buildings.Values.Where(b => b.NoCity != null).Select(b => b.NoCity!.Value).Distinct().ToList();
        Dictionary<int, string> villes = await context.Villes.Where(v => cityIds.Contains(v.Numero)).ToDictionaryAsync(v => v.Numero, v => v.Designation);

        List<Facture> facturesImpayees = await context.Factures
            .Where(f => locationIds.Contains(f.NoLocation) && EtatsImpayes.Contains(f.Etat))
            .ToListAsync();
        Dictionary<int, decimal> montantsImpayes = facturesImpayees.GroupBy(f => f.NoLocation).ToDictionary(g => g.Key, g => g.Sum(f => f.Montant));

        var contentieuxIds = items.Select(x => x.Numero).ToList();
        Dictionary<int, int> avocatCounts = await context.Avocats
            .Where(a => contentieuxIds.Contains(a.NoContentieux))
            .GroupBy(a => a.NoContentieux)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count);

        return items.Select(item =>
        {
            Bail? bail = item.NoLocation is int noLocation && baux.TryGetValue(noLocation, out Bail? b) ? b : null;
            string? nomBuilding = null, ville = null, nomLocataire = null;

            if (bail != null)
            {
                if (buildings.TryGetValue(bail.NoBuilding, out Building? building))
                {
                    nomBuilding = building.Designation;
                    if (building.NoCity != null)
                    {
                        villes.TryGetValue(building.NoCity.Value, out ville);
                    }
                }

                if (locataires.TryGetValue(bail.NoLocataire, out Locataire? locataire))
                {
                    nomLocataire = locataire.TypeLocataire == 1 ? locataire.DesignationEntreprise : $"{locataire.Nom} {locataire.Prenom}".Trim();
                }
            }

            decimal montantImpaye = item.NoLocation is int noLoc && montantsImpayes.TryGetValue(noLoc, out decimal m) ? m : 0;
            avocatCounts.TryGetValue(item.Numero, out int avocatCount);

            return ToResponse(item, bail?.NumContratLocations, nomLocataire, nomBuilding, ville, montantImpaye, avocatCount);
        }).ToList();
    }

    public async Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request)
    {
        try
        {
            if (request.PageNumber < 1) request.PageNumber = 1;
            if (request.PageSize is < 1 or > 100) request.PageSize = 10;

            IQueryable<SuiviContentieux> query = context.SuivisContentieux;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.AddDate);

            List<SuiviContentieux> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var locationIds = allMatching.Where(s => s.NoLocation != null).Select(s => s.NoLocation!.Value).Distinct().ToList();
                Dictionary<int, Bail> baux = await context.Baux.Where(b => locationIds.Contains(b.Numero)).ToDictionaryAsync(b => b.Numero);
                var locataireIds = baux.Values.Select(b => b.NoLocataire).Distinct().ToList();
                Dictionary<int, Locataire> locataires = await context.Locataires.Where(l => locataireIds.Contains(l.Numero)).ToDictionaryAsync(l => l.Numero);
                var buildingIds = baux.Values.Select(b => b.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings.Where(b => buildingIds.Contains(b.Numero)).ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching.Where(s =>
                {
                    if (s.NoLocation is not int noLocation || !baux.TryGetValue(noLocation, out Bail? bail))
                    {
                        return false;
                    }

                    string nomLocataire = locataires.TryGetValue(bail.NoLocataire, out Locataire? loc)
                        ? (loc.TypeLocataire == 1 ? loc.DesignationEntreprise ?? "" : $"{loc.Nom} {loc.Prenom}".Trim())
                        : "";
                    string nomBuilding = buildingNames.TryGetValue(bail.NoBuilding, out string? bn) ? bn : "";

                    return nomLocataire.ToLower().Contains(search) || nomBuilding.ToLower().Contains(search);
                }).ToList();
            }

            int totalCount = allMatching.Count;
            List<SuiviContentieux> items = allMatching.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToList();

            List<SuiviContentieuxResponse> mapped = await ToResponseListAsync(items);

            return new PagedResult<object>
            {
                Items = mapped.Cast<object>().ToList(),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }
        catch (Exception ex)
        {
            logger.LogError("Error fetching SuivisContentieux: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<SuiviContentieuxResponse> GetByIdAsync(int id)
    {
        SuiviContentieux? entity = await context.SuivisContentieux.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("SuiviContentieux not found");
        return await ToResponseAsync(entity);
    }

    public async Task<SuiviContentieuxResponse> CreateAsync(SuiviContentieuxRequest request)
    {
        // RMANew (DataEntrySuiviJuridique.vb) : ce formulaire n'a pas de champ Bail, en
        // création comme en édition - NoLocation n'y est jamais validé ni même lu.
        var entity = new SuiviContentieux
        {
            NoLocation = request.NoLocation,
            NatureProcedure = request.NatureProcedure,
            Observation = request.Observation,
            Description = request.Description,
            StatutDossier = string.IsNullOrWhiteSpace(request.StatutDossier) ? "Nouveau" : request.StatutDossier,
            DateDebutContentieux = request.DateDebutContentieux,
            DateEncaissement = request.DateEncaissement,
            MontantEncaisse = request.MontantEncaisse,
            SoldeAnneePrecedente = request.SoldeAnneePrecedente,
            PieceJointe = request.PieceJointe,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.SuivisContentieux.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("SuiviContentieux with ID {Numero} created successfully for Bail {NoLocation}.", entity.Numero, entity.NoLocation);

        return await ToResponseAsync(entity);
    }

    public async Task<SuiviContentieuxResponse> UpdateAsync(int id, SuiviContentieuxRequest request)
    {
        SuiviContentieux? entity = await context.SuivisContentieux.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("SuiviContentieux not found");

        entity.NoLocation = request.NoLocation;
        entity.NatureProcedure = request.NatureProcedure;
        entity.Observation = request.Observation;
        entity.Description = request.Description;
        entity.StatutDossier = string.IsNullOrWhiteSpace(request.StatutDossier) ? entity.StatutDossier : request.StatutDossier;
        entity.DateDebutContentieux = request.DateDebutContentieux;
        entity.DateEncaissement = request.DateEncaissement;
        entity.MontantEncaisse = request.MontantEncaisse;
        entity.SoldeAnneePrecedente = request.SoldeAnneePrecedente;
        entity.PieceJointe = request.PieceJointe;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("SuiviContentieux with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        SuiviContentieux? entity = await context.SuivisContentieux.FindAsync(id);
        if (entity == null) return 0;

        context.SuivisContentieux.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("SuiviContentieux with ID {Id} deleted successfully.", id);

        return result;
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Leasing;

public class LocataireService(DbDesignContext context, ILogger<LocataireService> logger) : ILocataireService
{
    private static string ComputeNomAffiche(Locataire entity) =>
        entity.TypeLocataire == 1
            ? entity.DesignationEntreprise ?? string.Empty
            : $"{entity.Nom} {entity.Prenom}".Trim();

    private static int ComputeTauxAvancement(Locataire entity)
    {
        int total = 4;
        int done = (entity.StatutsDispo ? 1 : 0) + (entity.RCDispo ? 1 : 0) +
                   (entity.PieceIdentiteDispo ? 1 : 0) + (entity.AutresDispo ? 1 : 0);
        return (int)Math.Round(done * 100.0 / total);
    }

    private async Task<LocataireResponse> ToResponseAsync(Locataire entity)
    {
        string? nomCity = entity.NoCity is null
            ? null
            : await context.Villes.Where(x => x.Numero == entity.NoCity).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomCountry = entity.NoCountry is null
            ? null
            : await context.PaysList.Where(x => x.Numero == entity.NoCountry).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomBuilding = entity.NoBuilding is null
            ? null
            : await context.Buildings.Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocal = entity.NoLocal is null
            ? null
            : await context.Locaux.Where(x => x.Numero == entity.NoLocal).Select(x => x.Designation).FirstOrDefaultAsync();

        return ToResponse(entity, nomCity, nomCountry, nomBuilding, nomLocal, null);
    }

    // RMANew (ListArchivesLocataires.vb) : snapshot du dernier bail connu (Archives
    // uniquement, voir EnrichWithDernierBailAsync) - null partout ailleurs.
    private sealed record DernierBailInfo(
        string? NomBuilding,
        int? NoProprietaire,
        decimal? LoyerMensuel,
        DateTime? PeriodeImpayesDebut,
        DateTime? PeriodeImpayesFin,
        int NbMoisImpaye,
        decimal MontantImpaye,
        string Etat);

    private static LocataireResponse ToResponse(
        Locataire entity, string? nomCity, string? nomCountry, string? nomBuilding, string? nomLocal, DernierBailInfo? dernierBail) =>
        new()
        {
            Numero = entity.Numero,
            TypeLocataire = entity.TypeLocataire,
            Nom = entity.Nom,
            Prenom = entity.Prenom,
            DesignationEntreprise = entity.DesignationEntreprise,
            NomAffiche = ComputeNomAffiche(entity),
            Rc = entity.Rc,
            IdF = entity.IdF,
            NoCIN = entity.NoCIN,
            ICE = entity.ICE,
            CodeLocataire = entity.CodeLocataire,
            Telephone = entity.Telephone,
            Email = entity.Email,
            Adresse = entity.Adresse,
            PostalCode = entity.PostalCode,
            NoCity = entity.NoCity,
            NomCity = nomCity,
            NoCountry = entity.NoCountry,
            NomCountry = nomCountry,
            Notes = entity.Notes,
            NoBuilding = entity.NoBuilding,
            NomBuilding = dernierBail?.NomBuilding ?? nomBuilding,
            NoLocal = entity.NoLocal,
            NomLocal = nomLocal,
            LoyerMensuel = dernierBail?.LoyerMensuel,
            PeriodeImpayesDebut = dernierBail?.PeriodeImpayesDebut,
            PeriodeImpayesFin = dernierBail?.PeriodeImpayesFin,
            NbMoisImpaye = dernierBail?.NbMoisImpaye,
            MontantImpaye = dernierBail?.MontantImpaye,
            Etat = dernierBail?.Etat,
            StatutsDispo = entity.StatutsDispo,
            RCDispo = entity.RCDispo,
            PieceIdentiteDispo = entity.PieceIdentiteDispo,
            AutresDispo = entity.AutresDispo,
            TauxAvancement = ComputeTauxAvancement(entity),
            AutreContactNom = entity.AutreContactNom,
            AutreContactPrenom = entity.AutreContactPrenom,
            AutreContactTelephone = entity.AutreContactTelephone,
            AutreContactPoste = entity.AutreContactPoste,
            AutreContactEmail = entity.AutreContactEmail,
            Inactif = entity.Inactif,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };

    private async Task<List<LocataireResponse>> ToResponseListAsync(
        List<Locataire> items, Dictionary<int, DernierBailInfo>? dernierBailParLocataire = null)
    {
        List<int> cityIds = items.Where(x => x.NoCity != null).Select(x => x.NoCity!.Value).Distinct().ToList();
        List<int> countryIds = items.Where(x => x.NoCountry != null).Select(x => x.NoCountry!.Value).Distinct().ToList();
        List<int> buildingIds = items.Where(x => x.NoBuilding != null).Select(x => x.NoBuilding!.Value).Distinct().ToList();
        List<int> localIds = items.Where(x => x.NoLocal != null).Select(x => x.NoLocal!.Value).Distinct().ToList();

        Dictionary<int, string> cities = await context.Villes.Where(x => cityIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> countries = await context.PaysList.Where(x => countryIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> buildings = await context.Buildings.Where(x => buildingIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> locaux = await context.Locaux.Where(x => localIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);

        return items.Select(item => ToResponse(
            item,
            item.NoCity != null && cities.TryGetValue(item.NoCity.Value, out string? city) ? city : null,
            item.NoCountry != null && countries.TryGetValue(item.NoCountry.Value, out string? country) ? country : null,
            item.NoBuilding != null && buildings.TryGetValue(item.NoBuilding.Value, out string? building) ? building : null,
            item.NoLocal != null && locaux.TryGetValue(item.NoLocal.Value, out string? local) ? local : null,
            dernierBailParLocataire != null && dernierBailParLocataire.TryGetValue(item.Numero, out DernierBailInfo? info) ? info : null
        )).ToList();
    }

    public Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request) =>
        GetPagedAsync(request, inactif: false);

    // Archives (RMANew ListArchivesLocataires.vb) : même liste (Locataire.inactif=1), plus
    // un aperçu du dernier bail connu du locataire (loyer, impayés, contentieux) - RMANew
    // prend le Location le plus récent (actif ou non) via un TOP 1 ORDER BY numero DESC,
    // pas seulement les baux encore actifs. Le filtre Réseau (Propriétaire) porte sur le
    // Propriétaire de l'actif de ce dernier bail (pas une colonne directe de Locataire),
    // donc le filtrage/paginage se fait ici plutôt que via QueryPagedAsync/ApplyFilters -
    // un locataire dont le dernier bail ne correspond pas au propriétaire filtré est exclu,
    // comme dans ListArchivesLocataires.vb (cfilter appliqué à la sous-requête Location).
    public async Task<PagedResult<object>> GetArchivedAsync(GetFilterSearchSortRequest request)
    {
        if (request.PageNumber < 1)
        {
            request.PageNumber = 1;
        }

        if (request.PageSize is < 1 or > 100)
        {
            request.PageSize = 10;
        }

        int? noProprietaire = request.Filters?
            .FirstOrDefault(f => string.Equals(f.Field, "NoProprietaire", StringComparison.OrdinalIgnoreCase))
            ?.Values.FirstOrDefault() is { } raw && int.TryParse(raw, out int parsed)
            ? parsed
            : null;

        IQueryable<Locataire> query = context.Locataires.Where(l => l.Inactif);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            string search = request.Search.Trim().ToLower();
            query = query.Where(e =>
                (e.Nom != null && e.Nom.ToLower().Contains(search)) ||
                (e.Prenom != null && e.Prenom.ToLower().Contains(search)) ||
                (e.DesignationEntreprise != null && e.DesignationEntreprise.ToLower().Contains(search)) ||
                (e.CodeLocataire != null && e.CodeLocataire.ToLower().Contains(search)));
        }

        List<Locataire> allMatching = await query.OrderBy(e => e.Nom).ToListAsync();

        Dictionary<int, DernierBailInfo> dernierBailParLocataire =
            await BuildDernierBailLookupAsync(allMatching.Select(i => i.Numero).ToList());

        List<Locataire> filtered = noProprietaire is null or 0
            ? allMatching
            : allMatching
                .Where(l => dernierBailParLocataire.TryGetValue(l.Numero, out DernierBailInfo? info) &&
                            info.NoProprietaire == noProprietaire)
                .ToList();

        int totalCount = filtered.Count;
        List<Locataire> pageItems = filtered
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        List<LocataireResponse> mapped = await ToResponseListAsync(pageItems, dernierBailParLocataire);

        return new PagedResult<object>
        {
            Items = mapped.Cast<object>().ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    private async Task<Dictionary<int, DernierBailInfo>> BuildDernierBailLookupAsync(List<int> locataireIds)
    {
        // Dernier bail (actif ou non) par locataire, comme RMANew (Location ORDER BY
        // numero DESC, TOP 1) - regroupé en mémoire pour prendre le plus récent par
        // locataire, le nombre de baux par locataire restant faible.
        List<Bail> baux = await context.Baux.Where(b => locataireIds.Contains(b.NoLocataire)).ToListAsync();
        Dictionary<int, Bail> dernierBailParLocataire = baux
            .GroupBy(b => b.NoLocataire)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(b => b.Numero).First());

        List<int> bailIds = dernierBailParLocataire.Values.Select(b => b.Numero).ToList();
        List<int> buildingIds = dernierBailParLocataire.Values.Select(b => b.NoBuilding).Distinct().ToList();

        Dictionary<int, (string Designation, int? NoProprietaire)> buildingsInfo = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero, b => (b.Designation, b.NoProprietaire));

        // Même logique que EtatLoyerService (Facture.Etat + solde restant par facture) :
        // le nouveau schéma recalcule l'impayé à la volée plutôt que de le lire sur un
        // champ dénormalisé comme RMANew (Location.LoyersImpayes/NbMoisImpayes).
        List<Facture> factures = await context.Factures
            .Where(f => bailIds.Contains(f.NoLocation) && f.Etat != "Annulée")
            .ToListAsync();
        List<int> factureIds = factures.Select(f => f.Numero).ToList();

        Dictionary<int, decimal> soldeParFacture = (await context.PaiementFactures
                .Where(pf => factureIds.Contains(pf.NoFacture))
                .ToListAsync())
            .GroupBy(pf => pf.NoFacture)
            .ToDictionary(g => g.Key, g => g.Sum(pf => pf.Montant));

        HashSet<int> bailsEnContentieux = (await context.SuivisContentieux
                .Where(s => s.NoLocation != null && bailIds.Contains(s.NoLocation.Value) && s.StatutDossier == "En Contentieux")
                .Select(s => s.NoLocation!.Value)
                .ToListAsync())
            .ToHashSet();

        Dictionary<int, DernierBailInfo> result = [];
        foreach ((int noLocataire, Bail bail) in dernierBailParLocataire)
        {
            List<Facture> facturesImpayees = factures
                .Where(f => f.NoLocation == bail.Numero && (f.Etat == "Impayée" || f.Etat == "Partiellement payée"))
                .ToList();

            decimal montantImpaye = facturesImpayees.Sum(f => Math.Max(0, f.Montant - soldeParFacture.GetValueOrDefault(f.Numero)));
            List<DateTime> periodesImpayees = facturesImpayees
                .Where(f => f.Montant - soldeParFacture.GetValueOrDefault(f.Numero) > 0.01m)
                .Select(f => f.Periode)
                .OrderBy(d => d)
                .ToList();

            buildingsInfo.TryGetValue(bail.NoBuilding, out (string Designation, int? NoProprietaire) buildingInfo);
            result[noLocataire] = new DernierBailInfo(
                buildingInfo.Designation,
                buildingInfo.NoProprietaire,
                bail.Montant,
                periodesImpayees.Count > 0 ? periodesImpayees[0] : null,
                periodesImpayees.Count > 0 ? periodesImpayees[^1] : null,
                periodesImpayees.Select(p => new { p.Year, p.Month }).Distinct().Count(),
                montantImpaye,
                bailsEnContentieux.Contains(bail.Numero) ? "Contentieux" : "Normale");
        }

        return result;
    }

    private async Task<(List<Locataire> Items, int TotalCount)> QueryPagedAsync(GetFilterSearchSortRequest request, bool inactif)
    {
        if (request.PageNumber < 1)
        {
            request.PageNumber = 1;
        }

        if (request.PageSize is < 1 or > 100)
        {
            request.PageSize = 10;
        }

        IQueryable<Locataire> query = context.Locataires.Where(l => l.Inactif == inactif);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            string search = request.Search.Trim().ToLower();
            query = query.Where(e =>
                (e.Nom != null && e.Nom.ToLower().Contains(search)) ||
                (e.Prenom != null && e.Prenom.ToLower().Contains(search)) ||
                (e.DesignationEntreprise != null && e.DesignationEntreprise.ToLower().Contains(search)) ||
                (e.CodeLocataire != null && e.CodeLocataire.ToLower().Contains(search)));
        }

        if (request.Filters != null && request.Filters.Any())
        {
            query = query.ApplyFilters(request.Filters);
        }

        query = !string.IsNullOrWhiteSpace(request.SortField)
            ? query.ApplySorting(request.SortField, request.SortOrder)
            : query.OrderBy(e => e.Nom);

        int totalCount = await query.CountAsync();

        List<Locataire> items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    private async Task<PagedResult<object>> GetPagedAsync(GetFilterSearchSortRequest request, bool inactif)
    {
        try
        {
            (List<Locataire> items, int totalCount) = await QueryPagedAsync(request, inactif);
            List<LocataireResponse> mapped = await ToResponseListAsync(items);

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
            logger.LogError("Error fetching Locataires: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<LocataireResponse> GetByIdAsync(int id)
    {
        Locataire? entity = await context.Locataires.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Locataire not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<LocataireResponse> CreateAsync(LocataireRequest request)
    {
        var entity = new Locataire
        {
            TypeLocataire = request.TypeLocataire,
            Nom = request.Nom,
            Prenom = request.Prenom,
            DesignationEntreprise = request.DesignationEntreprise,
            Rc = request.Rc,
            IdF = request.IdF,
            NoCIN = request.NoCIN,
            ICE = request.ICE,
            CodeLocataire = request.CodeLocataire,
            Telephone = request.Telephone,
            Email = request.Email,
            Adresse = request.Adresse,
            PostalCode = request.PostalCode,
            NoCity = request.NoCity,
            NoCountry = request.NoCountry,
            Notes = request.Notes,
            NoBuilding = request.NoBuilding,
            NoLocal = request.NoLocal,
            StatutsDispo = request.StatutsDispo,
            RCDispo = request.RCDispo,
            PieceIdentiteDispo = request.PieceIdentiteDispo,
            AutresDispo = request.AutresDispo,
            AutreContactNom = request.AutreContactNom,
            AutreContactPrenom = request.AutreContactPrenom,
            AutreContactTelephone = request.AutreContactTelephone,
            AutreContactPoste = request.AutreContactPoste,
            AutreContactEmail = request.AutreContactEmail,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Locataires.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Locataire with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<LocataireResponse> UpdateAsync(int id, LocataireRequest request)
    {
        Locataire? entity = await context.Locataires.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Locataire not found");
        }

        entity.TypeLocataire = request.TypeLocataire;
        entity.Nom = request.Nom;
        entity.Prenom = request.Prenom;
        entity.DesignationEntreprise = request.DesignationEntreprise;
        entity.Rc = request.Rc;
        entity.IdF = request.IdF;
        entity.NoCIN = request.NoCIN;
        entity.ICE = request.ICE;
        entity.CodeLocataire = request.CodeLocataire;
        entity.Telephone = request.Telephone;
        entity.Email = request.Email;
        entity.Adresse = request.Adresse;
        entity.PostalCode = request.PostalCode;
        entity.NoCity = request.NoCity;
        entity.NoCountry = request.NoCountry;
        entity.Notes = request.Notes;
        entity.NoBuilding = request.NoBuilding;
        entity.NoLocal = request.NoLocal;
        entity.StatutsDispo = request.StatutsDispo;
        entity.RCDispo = request.RCDispo;
        entity.PieceIdentiteDispo = request.PieceIdentiteDispo;
        entity.AutresDispo = request.AutresDispo;
        entity.AutreContactNom = request.AutreContactNom;
        entity.AutreContactPrenom = request.AutreContactPrenom;
        entity.AutreContactTelephone = request.AutreContactTelephone;
        entity.AutreContactPoste = request.AutreContactPoste;
        entity.AutreContactEmail = request.AutreContactEmail;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Locataire with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Locataire? entity = await context.Locataires.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Locataire with ID {Id} deactivated successfully.", id);

        return result;
    }

    // Archives : réactiver un locataire (RMANew ListArchivesLocataires -> UPDATE Locataire SET inactif=0).
    public async Task<LocataireResponse> ReactivateAsync(int id)
    {
        Locataire? entity = await context.Locataires.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Locataire not found");
        }

        entity.Inactif = false;
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        logger.LogInformation("Locataire with ID {Id} reactivated successfully.", id);

        return await ToResponseAsync(entity);
    }
}

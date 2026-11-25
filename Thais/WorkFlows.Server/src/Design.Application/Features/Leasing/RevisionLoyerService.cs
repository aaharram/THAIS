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

public class RevisionLoyerService(DbDesignContext context, ILogger<RevisionLoyerService> logger) : IRevisionLoyerService
{
    // RMANew (AvisRetard1/2, MiseEnDemeure) : 8% pour un usage HABITATION, 10% pour
    // tout autre usage (commercial, bureau...). Le cas nominatif codé en dur pour un
    // locataire précis ("Francoise Suzette") n'est pas repris : c'est de la dette
    // technique propre à l'ancien système, pas une règle métier généralisable.
    private const decimal TauxHabitation = 8m;
    private const decimal TauxAutreUsage = 10m;

    // Cycle légal de révision triennale (Loi marocaine 07.03 du 30/11/2007, Article 4).
    private const int CycleRevisionAnnees = 3;

    private static decimal TauxApplicable(string? usage) =>
        string.Equals(usage?.Trim(), "HABITATION", StringComparison.OrdinalIgnoreCase) ? TauxHabitation : TauxAutreUsage;

    private static decimal CalculerLoyerRevise(decimal loyerActuel, decimal taux) =>
        Math.Round(loyerActuel + loyerActuel * (taux / 100m), 2);

    private async Task<string?> ResolveNomLocataireAsync(int noLocataire)
    {
        Locataire? locataire = await context.Locataires.FindAsync(noLocataire);
        if (locataire == null)
        {
            return null;
        }

        return locataire.TypeLocataire == 1
            ? locataire.DesignationEntreprise
            : $"{locataire.Nom} {locataire.Prenom}".Trim();
    }

    private async Task<RevisionLoyerResponse> ToResponseAsync(RevisionLoyer entity)
    {
        Bail? bail = await context.Baux.FindAsync(entity.NoLocation);

        string? nomBuilding = bail == null ? null : await context.Buildings
            .Where(x => x.Numero == bail.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocal = bail == null ? null : await context.Locaux
            .Where(x => x.Numero == bail.NoLocal).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocataire = bail == null ? null : await ResolveNomLocataireAsync(bail.NoLocataire);

        return new RevisionLoyerResponse
        {
            Numero = entity.Numero,
            NoLocation = entity.NoLocation,
            NumContratLocations = bail?.NumContratLocations,
            NomLocataire = nomLocataire,
            NomBuilding = nomBuilding,
            NomLocal = nomLocal,
            AncienLoyer = entity.AncienLoyer,
            NouveauLoyer = entity.NouveauLoyer,
            TauxRevision = entity.TauxRevision,
            DateRevision = entity.DateRevision,
            DateProchaineRevision = entity.DateProchaineRevision,
            Reliquat = entity.Reliquat,
            Notes = entity.Notes,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    // Une ligne par bail actif : loyer courant, taux applicable et loyer projeté,
    // comme RMANew (RevisionsLoyers.aspx.GenerateTableUseJson). Un bail est éligible
    // dès que sa prochaine échéance triennale est atteinte.
    public async Task<PagedResult<object>> GetSummaryAsync(GetFilterSearchSortRequest request)
    {
        if (request.PageNumber < 1)
        {
            request.PageNumber = 1;
        }

        if (request.PageSize is < 1 or > 100)
        {
            request.PageSize = 10;
        }

        List<Bail> baux = await context.Baux
            .Where(b => !b.Inactif && b.Etat == "En cours de location")
            .ToListAsync();

        var buildingIds = baux.Select(b => b.NoBuilding).Distinct().ToList();
        var localIds = baux.Select(b => b.NoLocal).Distinct().ToList();
        var locataireIds = baux.Select(b => b.NoLocataire).Distinct().ToList();
        var bailIds = baux.Select(b => b.Numero).ToList();

        Dictionary<int, string> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero, b => b.Designation);
        Dictionary<int, string?> locaux = await context.Locaux
            .Where(l => localIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero, l => l.Designation);
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(l => locataireIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        var revisionsParBail = (await context.RevisionsLoyer
                .Where(r => bailIds.Contains(r.NoLocation))
                .ToListAsync())
            .GroupBy(r => r.NoLocation)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(r => r.DateRevision).ToList());

        var summaries = baux
            .Where(b => buildings.ContainsKey(b.NoBuilding))
            .Select(b =>
            {
                decimal loyerActuel = b.Montant ?? b.LoyerNet ?? 0;
                decimal taux = TauxApplicable(b.Usage);
                decimal loyerRevise = CalculerLoyerRevise(loyerActuel, taux);

                revisionsParBail.TryGetValue(b.Numero, out List<RevisionLoyer>? historique);
                RevisionLoyer? derniere = historique?.FirstOrDefault();

                DateTime? dateReference = derniere?.DateRevision ?? b.DateDebut;
                DateTime? prochaineEcheance = derniere?.DateProchaineRevision
                    ?? dateReference?.AddYears(CycleRevisionAnnees);

                locataires.TryGetValue(b.NoLocataire, out Locataire? locataire);
                string nomLocataire = locataire == null
                    ? ""
                    : locataire.TypeLocataire == 1
                        ? locataire.DesignationEntreprise ?? ""
                        : $"{locataire.Nom} {locataire.Prenom}".Trim();

                locaux.TryGetValue(b.NoLocal, out string? nomLocal);

                return new RevisionLoyerSummaryResponse
                {
                    NoLocation = b.Numero,
                    NumContratLocations = b.NumContratLocations,
                    NomLocataire = nomLocataire,
                    NomBuilding = buildings[b.NoBuilding],
                    NomLocal = nomLocal,
                    Usage = b.Usage,
                    LoyerActuel = loyerActuel,
                    TauxApplicable = taux,
                    LoyerApresRevision = loyerRevise,
                    DateDerniereRevision = derniere?.DateRevision,
                    DateProchaineRevision = prochaineEcheance,
                    EligibleRevision = prochaineEcheance.HasValue && prochaineEcheance.Value <= DateTime.UtcNow,
                    NombreRevisions = historique?.Count ?? 0
                };
            })
            .ToList();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            string search = request.Search.Trim().ToLower();
            summaries = summaries
                .Where(s => s.NomLocataire.ToLower().Contains(search) ||
                            s.NomBuilding.ToLower().Contains(search))
                .ToList();
        }

        summaries = summaries
            .OrderByDescending(s => s.EligibleRevision)
            .ThenBy(s => s.NomBuilding)
            .ToList();

        int totalCount = summaries.Count;
        List<RevisionLoyerSummaryResponse> page = summaries
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return new PagedResult<object>
        {
            Items = page.Cast<object>().ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    // Historique des révisions d'un bail donné (filtre NoLocation), équivalent du
    // drill-down "versions" utilisé pour les Expertises.
    public async Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request)
    {
        try
        {
            if (request.PageNumber < 1)
            {
                request.PageNumber = 1;
            }

            if (request.PageSize is < 1 or > 100)
            {
                request.PageSize = 10;
            }

            IQueryable<RevisionLoyer> query = context.RevisionsLoyer;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateRevision);

            int totalCount = await query.CountAsync();

            List<RevisionLoyer> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<RevisionLoyerResponse>();
            foreach (RevisionLoyer item in items)
            {
                mapped.Add(await ToResponseAsync(item));
            }

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
            logger.LogError("Error fetching RevisionsLoyer: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<RevisionLoyerResponse> GetByIdAsync(int id)
    {
        RevisionLoyer? entity = await context.RevisionsLoyer.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("RevisionLoyer not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<RevisionLoyerResponse> CreateAsync(RevisionLoyerRequest request)
    {
        Bail? bail = await context.Baux.FindAsync(request.NoLocation);
        if (bail == null)
        {
            throw new KeyNotFoundException("Bail not found");
        }

        decimal ancienLoyer = request.AncienLoyer ?? bail.Montant ?? bail.LoyerNet ?? 0;
        decimal taux = request.TauxRevision ?? TauxApplicable(bail.Usage);
        decimal nouveauLoyer = request.NouveauLoyer ?? CalculerLoyerRevise(ancienLoyer, taux);
        DateTime dateRevision = request.DateRevision ?? DateTime.UtcNow;
        DateTime dateProchaineRevision = request.DateProchaineRevision ?? dateRevision.AddYears(CycleRevisionAnnees);

        var entity = new RevisionLoyer
        {
            NoLocation = request.NoLocation,
            AncienLoyer = ancienLoyer,
            NouveauLoyer = nouveauLoyer,
            TauxRevision = taux,
            DateRevision = dateRevision,
            DateProchaineRevision = dateProchaineRevision,
            Reliquat = request.Reliquat,
            Notes = request.Notes,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.RevisionsLoyer.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("RevisionLoyer with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<RevisionLoyerResponse> UpdateAsync(int id, RevisionLoyerRequest request)
    {
        RevisionLoyer? entity = await context.RevisionsLoyer.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("RevisionLoyer not found");
        }

        entity.NoLocation = request.NoLocation;
        entity.AncienLoyer = request.AncienLoyer ?? entity.AncienLoyer;
        entity.NouveauLoyer = request.NouveauLoyer ?? entity.NouveauLoyer;
        entity.TauxRevision = request.TauxRevision ?? entity.TauxRevision;
        entity.DateRevision = request.DateRevision ?? entity.DateRevision;
        entity.DateProchaineRevision = request.DateProchaineRevision ?? entity.DateProchaineRevision;
        entity.Reliquat = request.Reliquat;
        entity.Notes = request.Notes;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("RevisionLoyer with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        RevisionLoyer? entity = await context.RevisionsLoyer.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.RevisionsLoyer.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("RevisionLoyer with ID {Id} deleted successfully.", id);

        return result;
    }
}

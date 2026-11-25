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

public class RelanceService(DbDesignContext context, ILogger<RelanceService> logger) : IRelanceService
{
    private static readonly string[] EtatsImpayes = ["Impayée", "Partiellement payée"];

    private async Task<RelanceResponse> ToResponseAsync(Relance entity)
    {
        Bail? bail = await context.Baux.FindAsync(entity.NoLocation);

        string? nomBuilding = bail == null ? null : await context.Buildings
            .Where(x => x.Numero == bail.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocataire = null;
        if (bail != null)
        {
            Locataire? locataire = await context.Locataires.FindAsync(bail.NoLocataire);
            if (locataire != null)
            {
                nomLocataire = locataire.TypeLocataire == 1
                    ? locataire.DesignationEntreprise
                    : $"{locataire.Nom} {locataire.Prenom}".Trim();
            }
        }

        return new RelanceResponse
        {
            Numero = entity.Numero,
            NoLocation = entity.NoLocation,
            NumContratLocations = bail?.NumContratLocations,
            NomLocataire = nomLocataire,
            NomBuilding = nomBuilding,
            TypeRelance = entity.TypeRelance,
            DateRelance = entity.DateRelance,
            TypeEnvoi = entity.TypeEnvoi,
            Notes = entity.Notes,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    // RMANew (ListSuiviRecouvrement.aspx) : une ligne par bail ayant un solde impayé -
    // ici calculé depuis l'agrégat Facture (Etat Impayée/Partiellement payée) plutôt que
    // depuis un champ dénormalisé Location.LoyersImpayes comme dans l'ancien système.
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

        List<Facture> facturesImpayees = await context.Factures
            .Where(f => EtatsImpayes.Contains(f.Etat) && f.Montant > 0)
            .ToListAsync();

        var soldesParBail = facturesImpayees
            .GroupBy(f => f.NoLocation)
            .ToDictionary(g => g.Key, g => new { Solde = g.Sum(f => f.Montant), Nombre = g.Count() });

        if (soldesParBail.Count == 0)
        {
            return new PagedResult<object>
            {
                Items = [],
                TotalCount = 0,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }

        var bailIds = soldesParBail.Keys.ToList();
        Dictionary<int, Bail> baux = await context.Baux
            .Where(b => bailIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        var buildingIds = baux.Values.Select(b => b.NoBuilding).Distinct().ToList();
        var localIds = baux.Values.Select(b => b.NoLocal).Distinct().ToList();
        var locataireIds = baux.Values.Select(b => b.NoLocataire).Distinct().ToList();

        Dictionary<int, string> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero, b => b.Designation);
        Dictionary<int, string?> locaux = await context.Locaux
            .Where(l => localIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero, l => l.Designation);
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(l => locataireIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        var relancesParBail = (await context.Relances
                .Where(r => bailIds.Contains(r.NoLocation))
                .ToListAsync())
            .GroupBy(r => r.NoLocation)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(r => r.DateRelance).ToList());

        var summaries = soldesParBail
            .Where(kv => baux.ContainsKey(kv.Key) && buildings.ContainsKey(baux[kv.Key].NoBuilding))
            .Select(kv =>
            {
                Bail bail = baux[kv.Key];
                locataires.TryGetValue(bail.NoLocataire, out Locataire? locataire);
                string nomLocataire = locataire == null
                    ? ""
                    : locataire.TypeLocataire == 1
                        ? locataire.DesignationEntreprise ?? ""
                        : $"{locataire.Nom} {locataire.Prenom}".Trim();

                locaux.TryGetValue(bail.NoLocal, out string? nomLocal);
                relancesParBail.TryGetValue(kv.Key, out List<Relance>? historique);
                Relance? derniere = historique?.FirstOrDefault();

                return new RelanceSummaryResponse
                {
                    NoLocation = kv.Key,
                    NumContratLocations = bail.NumContratLocations,
                    NomLocataire = nomLocataire,
                    NomBuilding = buildings[bail.NoBuilding],
                    NomLocal = nomLocal,
                    EtatBail = bail.Etat,
                    SoldeImpaye = kv.Value.Solde,
                    NombreFacturesImpayees = kv.Value.Nombre,
                    DerniereRelanceType = derniere?.TypeRelance,
                    DerniereRelanceDate = derniere?.DateRelance,
                    NombreRelances = historique?.Count ?? 0
                };
            })
            .ToList();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            string search = request.Search.Trim().ToLower();
            summaries = summaries
                .Where(s => s.NomLocataire.ToLower().Contains(search) || s.NomBuilding.ToLower().Contains(search))
                .ToList();
        }

        summaries = summaries.OrderByDescending(s => s.SoldeImpaye).ToList();

        int totalCount = summaries.Count;
        List<RelanceSummaryResponse> page = summaries
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

            IQueryable<Relance> query = context.Relances;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateRelance);

            int totalCount = await query.CountAsync();

            List<Relance> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<RelanceResponse>();
            foreach (Relance item in items)
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
            logger.LogError("Error fetching Relances: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<RelanceResponse> CreateAsync(RelanceRequest request)
    {
        Bail? bail = await context.Baux.FindAsync(request.NoLocation);
        if (bail == null)
        {
            throw new KeyNotFoundException("Bail not found");
        }

        var entity = new Relance
        {
            NoLocation = request.NoLocation,
            TypeRelance = request.TypeRelance,
            DateRelance = request.DateRelance ?? DateTime.UtcNow,
            TypeEnvoi = string.IsNullOrWhiteSpace(request.TypeEnvoi) ? "Manuel" : request.TypeEnvoi,
            Notes = request.Notes,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Relances.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Relance with ID {Numero} created successfully for Bail {NoLocation}.", entity.Numero, entity.NoLocation);

        return await ToResponseAsync(entity);
    }
}

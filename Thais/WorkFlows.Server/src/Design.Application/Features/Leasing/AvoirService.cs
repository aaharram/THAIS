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

public class AvoirService(DbDesignContext context, ILogger<AvoirService> logger) : IAvoirService
{
    private const string EtatPayee = "Payée";
    private const string EtatPartiellementPayee = "Partiellement payée";
    private const string EtatAnnulee = "Annulée";
    private const decimal SeuilSolde = 0.01m;

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

    private async Task<AvoirResponse> ToResponseAsync(Avoir entity, Facture? facture = null, decimal? montantAvant = null)
    {
        facture ??= await context.Factures.FindAsync(entity.NoFacture);
        Bail? bail = await context.Baux.FindAsync(entity.NoLocation);

        string? nomBuilding = bail == null ? null : await context.Buildings
            .Where(x => x.Numero == bail.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocal = bail == null ? null : await context.Locaux
            .Where(x => x.Numero == bail.NoLocal).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocataire = bail == null ? null : await ResolveNomLocataireAsync(bail.NoLocataire);

        return new AvoirResponse
        {
            Numero = entity.Numero,
            NoLocation = entity.NoLocation,
            NoFacture = entity.NoFacture,
            NumContratLocations = bail?.NumContratLocations,
            NomLocataire = nomLocataire,
            NomBuilding = nomBuilding,
            NomLocal = nomLocal,
            DateAvoir = entity.DateAvoir,
            Montant = entity.Montant,
            Notes = entity.Notes,
            MontantFactureAvant = montantAvant ?? facture?.Montant ?? 0,
            MontantFactureApres = facture?.Montant ?? 0,
            EtatFactureApres = facture?.Etat ?? "",
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
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

            IQueryable<Avoir> query = context.Avoirs;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateAvoir);

            List<Avoir> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var bailIds = allMatching.Select(a => a.NoLocation).Distinct().ToList();
                Dictionary<int, Bail> baux = await context.Baux
                    .Where(b => bailIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero);

                var buildingIds = baux.Values.Select(b => b.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(a => baux.TryGetValue(a.NoLocation, out Bail? b) &&
                                buildingNames.TryGetValue(b.NoBuilding, out string? name) &&
                                name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;

            List<Avoir> items = allMatching
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            var mapped = new List<AvoirResponse>();
            foreach (Avoir item in items)
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
            logger.LogError("Error fetching Avoirs: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<AvoirResponse> GetByIdAsync(int id)
    {
        Avoir? entity = await context.Avoirs.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Avoir not found");
        }

        return await ToResponseAsync(entity);
    }

    // RMANew (DataEntryEleaseAvoir.AfterSave) : un avoir réduit le solde de la facture liée
    // (Montant -= Avoir.Montant) ; si le reste tombe à <= 0.01, la facture est soldée
    // (Etat=Payée, Montant=0), sinon elle passe/reste Partiellement payée.
    public async Task<AvoirResponse> CreateAsync(AvoirRequest request)
    {
        Facture? facture = await context.Factures.FindAsync(request.NoFacture);
        if (facture == null)
        {
            throw new KeyNotFoundException("Facture not found");
        }

        if (facture.Etat == EtatPayee || facture.Etat == EtatAnnulee)
        {
            throw new InvalidOperationException("Impossible d'émettre un avoir sur une facture déjà payée ou annulée.");
        }

        decimal montantAvant = facture.Montant;
        decimal montantApres = Math.Max(0, montantAvant - request.Montant);

        facture.Montant = montantApres;
        facture.Etat = montantApres <= SeuilSolde ? EtatPayee : EtatPartiellementPayee;
        if (facture.Etat == EtatPayee)
        {
            facture.Montant = 0;
        }
        facture.ModDate = DateTime.UtcNow;

        var entity = new Avoir
        {
            NoLocation = facture.NoLocation,
            NoFacture = request.NoFacture,
            DateAvoir = request.DateAvoir,
            Montant = request.Montant,
            Notes = request.Notes,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Avoirs.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Avoir with ID {Numero} created successfully for Facture {NoFacture}.", entity.Numero, entity.NoFacture);

        return await ToResponseAsync(entity, facture, montantAvant);
    }
}

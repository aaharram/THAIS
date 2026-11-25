using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Leasing;

// RMANew (ListRemise.aspx / Classes/ListRemise.vb) : registre des remises bancaires.
// Liste en lecture seule (lAllowAdd=False côté RMANew - les lignes n'arrivent que via la
// synchro API bancaire, non reprise ici), avec sélection multiple et deux actions de masse :
// Annuler ("Confirmer") et Supprimer.
public class RemiseService(DbDesignContext context, ILogger<RemiseService> logger) : IRemiseService
{
    private static RemiseResponse ToResponse(Remise entity) => new()
    {
        Numero = entity.Numero,
        NumRemise = entity.NumRemise,
        Montant = entity.Montant,
        MontantRestant = entity.MontantRestant,
        Statut = entity.Statut,
        Reference = entity.Reference,
        IsAnnuler = entity.IsAnnuler,
        DateAnnulation = entity.DateAnnulation,
        AddDate = entity.AddDate
    };

    public async Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request, int statut, int annee, int mois)
    {
        try
        {
            if (request.PageNumber < 1) request.PageNumber = 1;
            if (request.PageSize is < 1 or > 100) request.PageSize = 10;

            IQueryable<Remise> query = context.Remises;

            // RMANew (ListRemise.vb, cFilter) reproduit tel quel, y compris son
            // comportement : dès que "Tous les statuts" (statut=0) est sélectionné avec une
            // Année et/ou un Mois - ou même sans aucun filtre du tout - la requête reste
            // bornée à Statut=0 ("Non consommé"). Ce n'est visiblement pas voulu par le
            // libellé "Tous les statuts", mais c'est le comportement réel de la liste RMANew,
            // donc reproduit fidèlement plutôt que "corrigé" silencieusement.
            if (statut > 0 && annee == 0 && mois == 0)
            {
                query = query.Where(r => r.Statut == statut);
            }
            else if (statut > 0 && annee > 0 && mois == 0)
            {
                query = query.Where(r => r.Statut == statut && r.AddDate.Year == annee);
            }
            else if (statut > 0 && annee > 0 && mois > 0)
            {
                query = query.Where(r => r.Statut == statut && r.AddDate.Year == annee && r.AddDate.Month == mois);
            }
            else if (statut == 0 && annee > 0 && mois == 0)
            {
                query = query.Where(r => r.Statut == 0 && r.AddDate.Year == annee);
            }
            else if (statut == 0 && annee > 0 && mois > 0)
            {
                query = query.Where(r => r.Statut == 0 && r.AddDate.Year == annee && r.AddDate.Month == mois);
            }
            else if (statut == 0 && annee == 0 && mois == 0)
            {
                query = query.Where(r => r.Statut == 0);
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.AddDate);

            List<Remise> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                allMatching = allMatching
                    .Where(r => (r.NumRemise != null && r.NumRemise.ToLower().Contains(search)) ||
                                (r.Reference != null && r.Reference.ToLower().Contains(search)))
                    .ToList();
            }

            int totalCount = allMatching.Count;
            List<Remise> items = allMatching.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToList();

            return new PagedResult<object>
            {
                Items = items.Select(ToResponse).Cast<object>().ToList(),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }
        catch (Exception ex)
        {
            logger.LogError("Error fetching Remises: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<List<int>> GetAnneesAsync() =>
        await context.Remises.Select(r => r.AddDate.Year).Distinct().OrderByDescending(y => y).ToListAsync();

    public async Task<List<int>> GetMoisAsync(int annee) =>
        await context.Remises.Where(r => r.AddDate.Year == annee).Select(r => r.AddDate.Month).Distinct().OrderBy(m => m).ToListAsync();

    public async Task AnnulerAsync(List<int> ids)
    {
        List<Remise> items = await context.Remises.Where(r => ids.Contains(r.Numero)).ToListAsync();
        foreach (Remise item in items)
        {
            item.IsAnnuler = true;
            item.DateAnnulation = DateTime.UtcNow;
            item.ModDate = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();

        logger.LogInformation("{Count} Remise(s) annulée(s).", items.Count);
    }

    public async Task SupprimerAsync(List<int> ids)
    {
        List<Remise> items = await context.Remises.Where(r => ids.Contains(r.Numero)).ToListAsync();
        context.Remises.RemoveRange(items);
        await context.SaveChangesAsync();

        logger.LogInformation("{Count} Remise(s) supprimée(s).", items.Count);
    }
}

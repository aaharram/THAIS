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

// RMANew (ListAvocat.aspx/DataEntryAvocat.aspx) : sous-liste d'avocats d'un dossier
// SuiviContentieux (NoContentieux). Pas de gestion de pièce jointe ici, comme pour les
// autres "Pieces jointe" de ce périmètre - aucune infrastructure de stockage de fichiers.
public class AvocatService(DbDesignContext context, ILogger<AvocatService> logger) : IAvocatService
{
    private static AvocatResponse ToResponse(Avocat entity) => new()
    {
        Numero = entity.Numero,
        NoContentieux = entity.NoContentieux,
        Nom = entity.Nom,
        Prenom = entity.Prenom,
        Cabinet = entity.Cabinet,
        Contrat = entity.Contrat,
        PieceJointe = entity.PieceJointe,
        AddUser = entity.AddUser,
        AddDate = entity.AddDate
    };

    public async Task<PagedResult<object>> GetAllAsync(int noContentieux, GetFilterSearchSortRequest request)
    {
        try
        {
            if (request.PageNumber < 1) request.PageNumber = 1;
            if (request.PageSize is < 1 or > 100) request.PageSize = 10;

            IQueryable<Avocat> query = context.Avocats.Where(a => a.NoContentieux == noContentieux);

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.AddDate);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(a =>
                    (a.Nom != null && a.Nom.ToLower().Contains(search)) ||
                    (a.Prenom != null && a.Prenom.ToLower().Contains(search)) ||
                    (a.Cabinet != null && a.Cabinet.ToLower().Contains(search)) ||
                    (a.Contrat != null && a.Contrat.ToLower().Contains(search)));
            }

            int totalCount = await query.CountAsync();
            List<Avocat> items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToListAsync();

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
            logger.LogError("Error fetching Avocats: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<AvocatResponse> GetByIdAsync(int id)
    {
        Avocat? entity = await context.Avocats.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Avocat not found");
        return ToResponse(entity);
    }

    public async Task<AvocatResponse> CreateAsync(AvocatRequest request)
    {
        SuiviContentieux? dossier = await context.SuivisContentieux.FindAsync(request.NoContentieux);
        if (dossier == null)
        {
            throw new KeyNotFoundException("SuiviContentieux not found");
        }

        var entity = new Avocat
        {
            NoContentieux = request.NoContentieux,
            Nom = request.Nom,
            Prenom = request.Prenom,
            Cabinet = request.Cabinet,
            Contrat = request.Contrat,
            PieceJointe = request.PieceJointe,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Avocats.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Avocat with ID {Numero} created successfully for dossier {NoContentieux}.", entity.Numero, entity.NoContentieux);

        return ToResponse(entity);
    }

    public async Task<AvocatResponse> UpdateAsync(int id, AvocatRequest request)
    {
        Avocat? entity = await context.Avocats.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Avocat not found");

        entity.Nom = request.Nom;
        entity.Prenom = request.Prenom;
        entity.Cabinet = request.Cabinet;
        entity.Contrat = request.Contrat;
        entity.PieceJointe = request.PieceJointe;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Avocat with ID {Id} updated successfully.", id);

        return ToResponse(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Avocat? entity = await context.Avocats.FindAsync(id);
        if (entity == null) return 0;

        context.Avocats.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Avocat with ID {Id} deleted successfully.", id);

        return result;
    }

    public async Task<Dictionary<int, int>> GetCountsByContentieuxAsync(IEnumerable<int> noContentieuxList)
    {
        var ids = noContentieuxList.Distinct().ToList();
        return await context.Avocats
            .Where(a => ids.Contains(a.NoContentieux))
            .GroupBy(a => a.NoContentieux)
            .Select(g => new { g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Key, x => x.Count);
    }
}

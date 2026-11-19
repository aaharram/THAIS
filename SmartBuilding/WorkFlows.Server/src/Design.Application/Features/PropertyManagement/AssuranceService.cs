using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.PropertyManagement;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.PropertyManagement;
using Design.Infrastructure.Data;

namespace Design.Application.Features.PropertyManagement;

public class AssuranceService(DbDesignContext context, ILogger<AssuranceService> logger) : IAssuranceService
{
    private async Task<AssuranceResponse> ToResponseAsync(Assurance entity)
    {
        string? nomAssureur = await context.Assureurs
            .Where(x => x.Numero == entity.NoAssureur).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomCourtier = entity.NoCourtier is null
            ? null
            : await context.Courtiers.Where(x => x.Numero == entity.NoCourtier).Select(x => x.Designation).FirstOrDefaultAsync();

        return ToResponse(entity, nomAssureur, nomCourtier);
    }

    private static AssuranceResponse ToResponse(Assurance entity, string? nomAssureur, string? nomCourtier) => new()
    {
        Numero = entity.Numero,
        NumPolice = entity.NumPolice,
        NoAssureur = entity.NoAssureur,
        NomAssureur = nomAssureur,
        NoCourtier = entity.NoCourtier,
        NomCourtier = nomCourtier,
        TypeCouverture = entity.TypeCouverture,
        DateEffetContrat = entity.DateEffetContrat,
        Montant = entity.Montant,
        Statut = entity.Statut,
        Notes = entity.Notes,
        Inactif = entity.Inactif,
        AddUser = entity.AddUser,
        AddDate = entity.AddDate,
        ModUser = entity.ModUser,
        ModDate = entity.ModDate
    };

    private async Task<List<AssuranceResponse>> ToResponseListAsync(List<Assurance> items)
    {
        List<int> assureurIds = items.Select(x => x.NoAssureur).Distinct().ToList();
        List<int> courtierIds = items.Where(x => x.NoCourtier != null).Select(x => x.NoCourtier!.Value).Distinct().ToList();

        Dictionary<int, string> assureurs = await context.Assureurs.Where(x => assureurIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> courtiers = await context.Courtiers.Where(x => courtierIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);

        return items.Select(item => ToResponse(
            item,
            assureurs.TryGetValue(item.NoAssureur, out string? assureur) ? assureur : null,
            item.NoCourtier != null && courtiers.TryGetValue(item.NoCourtier.Value, out string? courtier) ? courtier : null
        )).ToList();
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

            IQueryable<Assurance> query = context.Assurances.Where(e => !e.Inactif);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.NumPolice != null && e.NumPolice.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateEffetContrat);

            int totalCount = await query.CountAsync();

            List<Assurance> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            List<AssuranceResponse> mapped = await ToResponseListAsync(items);

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
            logger.LogError("Error fetching Assurances: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<AssuranceResponse> GetByIdAsync(int id)
    {
        Assurance? entity = await context.Assurances.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Assurance not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<AssuranceResponse> CreateAsync(AssuranceRequest request)
    {
        var entity = new Assurance
        {
            NumPolice = request.NumPolice,
            NoAssureur = request.NoAssureur,
            NoCourtier = request.NoCourtier,
            TypeCouverture = request.TypeCouverture,
            DateEffetContrat = request.DateEffetContrat,
            Montant = request.Montant,
            Statut = request.Statut,
            Notes = request.Notes,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Assurances.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Assurance with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<AssuranceResponse> UpdateAsync(int id, AssuranceRequest request)
    {
        Assurance? entity = await context.Assurances.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Assurance not found");
        }

        entity.NumPolice = request.NumPolice;
        entity.NoAssureur = request.NoAssureur;
        entity.NoCourtier = request.NoCourtier;
        entity.TypeCouverture = request.TypeCouverture;
        entity.DateEffetContrat = request.DateEffetContrat;
        entity.Montant = request.Montant;
        entity.Statut = request.Statut;
        entity.Notes = request.Notes;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Assurance with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Assurance? entity = await context.Assurances.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Assurance with ID {Id} deactivated successfully.", id);

        return result;
    }
}

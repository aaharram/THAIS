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

public class SyndicService(DbDesignContext context, ILogger<SyndicService> logger) : ISyndicService
{
    private static SyndicResponse ToResponse(Syndic entity) => new()
    {
        Numero = entity.Numero,
        Nom = entity.Nom,
        Prenom = entity.Prenom,
        Poste = entity.Poste,
        Telephone = entity.Telephone,
        DebutMandat = entity.DebutMandat,
        FinMandat = entity.FinMandat,
        IdSyndic = entity.IdSyndic,
        Notes = entity.Notes,
        Inactif = entity.Inactif,
        AddUser = entity.AddUser,
        AddDate = entity.AddDate,
        ModUser = entity.ModUser,
        ModDate = entity.ModDate
    };

    public async Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request)
    {
        try
        {
            if (request.PageNumber < 1) request.PageNumber = 1;
            if (request.PageSize is < 1 or > 100) request.PageSize = 10;

            IQueryable<Syndic> query = context.Syndics.Where(e => !e.Inactif);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.Nom.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderBy(e => e.Nom);

            int totalCount = await query.CountAsync();
            List<Syndic> items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToListAsync();

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
            logger.LogError("Error fetching Syndics: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<SyndicResponse> GetByIdAsync(int id)
    {
        Syndic? entity = await context.Syndics.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Syndic not found");
        return ToResponse(entity);
    }

    public async Task<SyndicResponse> CreateAsync(SyndicRequest request)
    {
        var entity = new Syndic
        {
            Nom = request.Nom.Trim(),
            Prenom = request.Prenom,
            Poste = request.Poste,
            Telephone = request.Telephone,
            DebutMandat = request.DebutMandat,
            FinMandat = request.FinMandat,
            Notes = request.Notes,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Syndics.Add(entity);
        await context.SaveChangesAsync();

        entity.IdSyndic = $"SYN{entity.Numero}";
        await context.SaveChangesAsync();

        logger.LogInformation("Syndic with ID {Numero} created successfully.", entity.Numero);

        return ToResponse(entity);
    }

    public async Task<SyndicResponse> UpdateAsync(int id, SyndicRequest request)
    {
        Syndic? entity = await context.Syndics.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Syndic not found");

        entity.Nom = request.Nom.Trim();
        entity.Prenom = request.Prenom;
        entity.Poste = request.Poste;
        entity.Telephone = request.Telephone;
        entity.DebutMandat = request.DebutMandat;
        entity.FinMandat = request.FinMandat;
        entity.Notes = request.Notes;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Syndic with ID {Id} updated successfully.", id);

        return ToResponse(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Syndic? entity = await context.Syndics.FindAsync(id);
        if (entity == null) return 0;

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Syndic with ID {Id} deactivated successfully.", id);

        return result;
    }
}

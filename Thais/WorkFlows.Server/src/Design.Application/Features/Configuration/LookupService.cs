using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Configuration;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Configuration;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Configuration;

public class LookupService<T>(DbDesignContext context, ILogger<LookupService<T>> logger) : ILookupService<T>
    where T : LookupEntity, new()
{
    private static LookupResponse ToResponse(T entity)
    {
        return new LookupResponse
        {
            Numero = entity.Numero,
            Designation = entity.Designation,
            Taux = (entity as LookupWithRateEntity)?.Taux,
            AccesComplet = (entity as LookupWithFlagEntity)?.AccesComplet,
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

            // Listes de référence (villes, pays...) : les formulaires les chargent en entier (pageSize 1000) ; au-delà
            // de 100 on plafonnait à 10 lignes, ce qui tronquait les listes déroulantes (118 villes -> 10).
            if (request.PageSize < 1)
            {
                request.PageSize = 10;
            }
            else if (request.PageSize > 1000)
            {
                request.PageSize = 1000;
            }

            IQueryable<T> query = context.Set<T>().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.Designation.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderBy(e => e.Designation);

            int totalCount = await query.CountAsync();

            List<T> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

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
            logger.LogError("Error fetching {Entity}: {ExMessage}", typeof(T).Name, ex.Message);
            throw;
        }
    }

    public async Task<LookupResponse> GetByIdAsync(int id)
    {
        T? entity = await context.Set<T>().FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException($"{typeof(T).Name} not found");
        }

        return ToResponse(entity);
    }

    public async Task<LookupResponse> CreateAsync(LookupRequest request)
    {
        var entity = new T
        {
            Designation = request.Designation.Trim(),
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        if (entity is LookupWithRateEntity rateEntity)
        {
            rateEntity.Taux = request.Taux ?? 0;
        }

        if (entity is LookupWithFlagEntity flagEntity)
        {
            flagEntity.AccesComplet = request.AccesComplet ?? false;
        }

        context.Set<T>().Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("{Entity} with ID {Numero} created successfully.", typeof(T).Name, entity.Numero);

        return ToResponse(entity);
    }

    public async Task<LookupResponse> UpdateAsync(int id, LookupRequest request)
    {
        T? entity = await context.Set<T>().FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException($"{typeof(T).Name} not found");
        }

        entity.Designation = request.Designation.Trim();
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        if (entity is LookupWithRateEntity rateEntity)
        {
            rateEntity.Taux = request.Taux ?? rateEntity.Taux;
        }

        if (entity is LookupWithFlagEntity flagEntity)
        {
            flagEntity.AccesComplet = request.AccesComplet ?? flagEntity.AccesComplet;
        }

        await context.SaveChangesAsync();

        logger.LogInformation("{Entity} with ID {Id} updated successfully.", typeof(T).Name, id);

        return ToResponse(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        T? entity = await context.Set<T>().FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.Set<T>().Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("{Entity} with ID {Id} deleted successfully.", typeof(T).Name, id);

        return result;
    }
}

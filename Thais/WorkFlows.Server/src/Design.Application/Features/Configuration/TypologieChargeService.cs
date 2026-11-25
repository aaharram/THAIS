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

public class TypologieChargeService(DbDesignContext context, ILogger<TypologieChargeService> logger)
    : ITypologieChargeService
{
    private static TypologieChargeResponse ToResponse(TypologieCharge entity)
    {
        return new TypologieChargeResponse
        {
            Numero = entity.Numero,
            Typologie = entity.Typologie,
            Compte = entity.Compte,
            Description = entity.Description,
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

            IQueryable<TypologieCharge> query = context.TypologiesCharge.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.Typologie.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderBy(e => e.Typologie);

            int totalCount = await query.CountAsync();

            List<TypologieCharge> items = await query
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
            logger.LogError("Error fetching TypologiesCharge: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<TypologieChargeResponse> GetByIdAsync(int id)
    {
        TypologieCharge? entity = await context.TypologiesCharge.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("TypologieCharge not found");
        }

        return ToResponse(entity);
    }

    public async Task<TypologieChargeResponse> CreateAsync(TypologieChargeRequest request)
    {
        var entity = new TypologieCharge
        {
            Typologie = request.Typologie.Trim(),
            Compte = request.Compte?.Trim(),
            Description = request.Description?.Trim(),
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.TypologiesCharge.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("TypologieCharge with ID {Numero} created successfully.", entity.Numero);

        return ToResponse(entity);
    }

    public async Task<TypologieChargeResponse> UpdateAsync(int id, TypologieChargeRequest request)
    {
        TypologieCharge? entity = await context.TypologiesCharge.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("TypologieCharge not found");
        }

        entity.Typologie = request.Typologie.Trim();
        entity.Compte = request.Compte?.Trim();
        entity.Description = request.Description?.Trim();
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("TypologieCharge with ID {Id} updated successfully.", id);

        return ToResponse(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        TypologieCharge? entity = await context.TypologiesCharge.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.TypologiesCharge.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("TypologieCharge with ID {Id} deleted successfully.", id);

        return result;
    }
}

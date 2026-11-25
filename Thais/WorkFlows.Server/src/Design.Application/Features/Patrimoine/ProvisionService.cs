using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Patrimoine;

public class ProvisionService(DbDesignContext context, ILogger<ProvisionService> logger) : IProvisionService
{
    private async Task<ProvisionResponse> ToResponseAsync(Provision entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();

        return new ProvisionResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            MontantProvision = entity.MontantProvision,
            DateProvision = entity.DateProvision,
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

            IQueryable<Provision> query = context.Provisions;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateProvision);

            int totalCount = await query.CountAsync();

            List<Provision> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<ProvisionResponse>();
            foreach (Provision item in items)
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
            logger.LogError("Error fetching Provisions: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<ProvisionResponse> GetByIdAsync(int id)
    {
        Provision? entity = await context.Provisions.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Provision not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<ProvisionResponse> CreateAsync(ProvisionRequest request)
    {
        var entity = new Provision
        {
            NoBuilding = request.NoBuilding,
            MontantProvision = request.MontantProvision,
            DateProvision = request.DateProvision,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Provisions.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Provision with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<ProvisionResponse> UpdateAsync(int id, ProvisionRequest request)
    {
        Provision? entity = await context.Provisions.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Provision not found");
        }

        entity.NoBuilding = request.NoBuilding;
        entity.MontantProvision = request.MontantProvision;
        entity.DateProvision = request.DateProvision;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Provision with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Provision? entity = await context.Provisions.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.Provisions.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Provision with ID {Id} deleted successfully.", id);

        return result;
    }
}

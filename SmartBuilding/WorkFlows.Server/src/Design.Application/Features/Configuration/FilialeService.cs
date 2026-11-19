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

public class FilialeService(DbDesignContext context, ILogger<FilialeService> logger) : IFilialeService
{
    private async Task<FilialeResponse> ToResponseAsync(Filiale entity)
    {
        string? nomBanque = null;
        if (entity.NoBanque is not null)
        {
            nomBanque = await context.Banques
                .Where(b => b.Numero == entity.NoBanque)
                .Select(b => b.Designation)
                .FirstOrDefaultAsync();
        }

        return new FilialeResponse
        {
            Numero = entity.Numero,
            Nom = entity.Nom,
            NumeroReference = entity.NumeroReference,
            Date = entity.Date,
            Rib = entity.Rib,
            NoBanque = entity.NoBanque,
            NomBanque = nomBanque,
            ModeReglement = entity.ModeReglement,
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

            IQueryable<Filiale> query = context.Filiales.AsQueryable();

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

            List<Filiale> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<FilialeResponse>();
            foreach (Filiale item in items)
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
            logger.LogError("Error fetching Filiales: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<FilialeResponse> GetByIdAsync(int id)
    {
        Filiale? entity = await context.Filiales.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Filiale not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<FilialeResponse> CreateAsync(FilialeRequest request)
    {
        var entity = new Filiale
        {
            Nom = request.Nom.Trim(),
            NumeroReference = request.NumeroReference?.Trim(),
            Date = request.Date,
            Rib = request.Rib?.Trim(),
            NoBanque = request.NoBanque,
            ModeReglement = request.ModeReglement,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Filiales.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Filiale with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<FilialeResponse> UpdateAsync(int id, FilialeRequest request)
    {
        Filiale? entity = await context.Filiales.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Filiale not found");
        }

        entity.Nom = request.Nom.Trim();
        entity.NumeroReference = request.NumeroReference?.Trim();
        entity.Date = request.Date;
        entity.Rib = request.Rib?.Trim();
        entity.NoBanque = request.NoBanque;
        entity.ModeReglement = request.ModeReglement;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Filiale with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Filiale? entity = await context.Filiales.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.Filiales.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Filiale with ID {Id} deleted successfully.", id);

        return result;
    }
}

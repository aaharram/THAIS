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

public class SuspensionService(DbDesignContext context, ILogger<SuspensionService> logger) : ISuspensionService
{
    private async Task<SuspensionResponse> ToResponseAsync(Suspension entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();

        Bail? bail = await context.Baux.FindAsync(entity.NoContratLocation);
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

        return new SuspensionResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            NoContratLocation = entity.NoContratLocation,
            NumContratLocations = bail?.NumContratLocations,
            NomLocataire = nomLocataire,
            MotifSuspension = entity.MotifSuspension,
            StatutValidation = entity.StatutValidation,
            DateSuspension = entity.DateSuspension,
            DateArretSuspension = entity.DateArretSuspension,
            Inactif = entity.Inactif,
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

            IQueryable<Suspension> query = context.Suspensions.Where(s => !s.Inactif);

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Numero);

            int totalCount = await query.CountAsync();

            List<Suspension> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<SuspensionResponse>();
            foreach (Suspension item in items)
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
            logger.LogError("Error fetching Suspensions: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<SuspensionResponse> GetByIdAsync(int id)
    {
        Suspension? entity = await context.Suspensions.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Suspension not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<SuspensionResponse> CreateAsync(SuspensionRequest request)
    {
        var entity = new Suspension
        {
            NoBuilding = request.NoBuilding,
            NoContratLocation = request.NoContratLocation,
            MotifSuspension = request.MotifSuspension,
            StatutValidation = request.StatutValidation,
            DateSuspension = request.DateSuspension,
            DateArretSuspension = request.DateArretSuspension,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Suspensions.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Suspension with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<SuspensionResponse> UpdateAsync(int id, SuspensionRequest request)
    {
        Suspension? entity = await context.Suspensions.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Suspension not found");
        }

        entity.NoBuilding = request.NoBuilding;
        entity.NoContratLocation = request.NoContratLocation;
        entity.MotifSuspension = request.MotifSuspension;
        entity.StatutValidation = request.StatutValidation;
        entity.DateSuspension = request.DateSuspension;
        entity.DateArretSuspension = request.DateArretSuspension;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Suspension with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Suspension? entity = await context.Suspensions.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Suspension with ID {Id} deactivated successfully.", id);

        return result;
    }
}

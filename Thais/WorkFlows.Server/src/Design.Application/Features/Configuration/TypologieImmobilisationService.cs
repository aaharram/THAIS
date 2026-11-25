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

public class TypologieImmobilisationService(DbDesignContext context, ILogger<TypologieImmobilisationService> logger)
    : ITypologieImmobilisationService
{
    private static TypologieImmobilisationResponse ToResponse(TypologieImmobilisation entity)
    {
        return new TypologieImmobilisationResponse
        {
            Numero = entity.Numero,
            ImmobilisationConcernee = entity.ImmobilisationConcernee,
            CompteComptable = entity.CompteComptable,
            CompteAmortissement = entity.CompteAmortissement,
            CompteDotation = entity.CompteDotation,
            Taux = entity.Taux,
            Duree = entity.Duree,
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

            IQueryable<TypologieImmobilisation> query = context.TypologiesImmobilisation.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.ImmobilisationConcernee.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderBy(e => e.ImmobilisationConcernee);

            int totalCount = await query.CountAsync();

            List<TypologieImmobilisation> items = await query
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
            logger.LogError("Error fetching TypologiesImmobilisation: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<TypologieImmobilisationResponse> GetByIdAsync(int id)
    {
        TypologieImmobilisation? entity = await context.TypologiesImmobilisation.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("TypologieImmobilisation not found");
        }

        return ToResponse(entity);
    }

    public async Task<TypologieImmobilisationResponse> CreateAsync(TypologieImmobilisationRequest request)
    {
        var entity = new TypologieImmobilisation
        {
            ImmobilisationConcernee = request.ImmobilisationConcernee.Trim(),
            CompteComptable = request.CompteComptable?.Trim(),
            CompteAmortissement = request.CompteAmortissement?.Trim(),
            CompteDotation = request.CompteDotation?.Trim(),
            Taux = request.Taux,
            Duree = request.Duree,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.TypologiesImmobilisation.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("TypologieImmobilisation with ID {Numero} created successfully.", entity.Numero);

        return ToResponse(entity);
    }

    public async Task<TypologieImmobilisationResponse> UpdateAsync(int id, TypologieImmobilisationRequest request)
    {
        TypologieImmobilisation? entity = await context.TypologiesImmobilisation.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("TypologieImmobilisation not found");
        }

        entity.ImmobilisationConcernee = request.ImmobilisationConcernee.Trim();
        entity.CompteComptable = request.CompteComptable?.Trim();
        entity.CompteAmortissement = request.CompteAmortissement?.Trim();
        entity.CompteDotation = request.CompteDotation?.Trim();
        entity.Taux = request.Taux;
        entity.Duree = request.Duree;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("TypologieImmobilisation with ID {Id} updated successfully.", id);

        return ToResponse(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        TypologieImmobilisation? entity = await context.TypologiesImmobilisation.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.TypologiesImmobilisation.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("TypologieImmobilisation with ID {Id} deleted successfully.", id);

        return result;
    }
}

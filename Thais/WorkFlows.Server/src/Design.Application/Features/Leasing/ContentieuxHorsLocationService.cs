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

public class ContentieuxHorsLocationService(DbDesignContext context, ILogger<ContentieuxHorsLocationService> logger)
    : IContentieuxHorsLocationService
{
    // RMANew (ListContentieuxHorsLocation.vb PostProcess, "NBMoisImpay") :
    // fin.Month - debut.Month + (fin.Year - debut.Year) * 12 + 1
    private static int ComputeNbMoisImpaye(DateTime debut, DateTime fin) =>
        fin.Month - debut.Month + (fin.Year - debut.Year) * 12 + 1;

    private static ContentieuxHorsLocationResponse ToResponse(ContentieuxHorsLocation entity) =>
        new()
        {
            Numero = entity.Numero,
            Locataire = entity.Locataire,
            CodeLocataire = entity.CodeLocataire,
            Immeuble = entity.Immeuble,
            LoyerMensuelTTC = entity.LoyerMensuelTTC,
            DateDebutImpaye = entity.DateDebutImpaye,
            DateFinImpaye = entity.DateFinImpaye,
            MontantLoyerImpaye = entity.MontantLoyerImpaye,
            Type = entity.Type,
            NbMoisImpaye = ComputeNbMoisImpaye(entity.DateDebutImpaye, entity.DateFinImpaye),
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };

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

            IQueryable<ContentieuxHorsLocation> query = context.ContentieuxHorsLocations;

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e =>
                    (e.Locataire != null && e.Locataire.ToLower().Contains(search)) ||
                    (e.CodeLocataire != null && e.CodeLocataire.ToLower().Contains(search)) ||
                    (e.Immeuble != null && e.Immeuble.ToLower().Contains(search)));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Numero);

            int totalCount = await query.CountAsync();

            List<ContentieuxHorsLocation> items = await query
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
            logger.LogError("Error fetching ContentieuxHorsLocation: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<ContentieuxHorsLocationResponse> GetByIdAsync(int id)
    {
        ContentieuxHorsLocation? entity = await context.ContentieuxHorsLocations.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("ContentieuxHorsLocation not found");
        }

        return ToResponse(entity);
    }

    public async Task<ContentieuxHorsLocationResponse> CreateAsync(ContentieuxHorsLocationRequest request)
    {
        var entity = new ContentieuxHorsLocation
        {
            Locataire = request.Locataire,
            CodeLocataire = request.CodeLocataire,
            Immeuble = request.Immeuble,
            LoyerMensuelTTC = request.LoyerMensuelTTC,
            DateDebutImpaye = request.DateDebutImpaye,
            DateFinImpaye = request.DateFinImpaye,
            MontantLoyerImpaye = request.MontantLoyerImpaye,
            Type = request.Type,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.ContentieuxHorsLocations.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("ContentieuxHorsLocation with ID {Numero} created successfully.", entity.Numero);

        return ToResponse(entity);
    }

    public async Task<ContentieuxHorsLocationResponse> UpdateAsync(int id, ContentieuxHorsLocationRequest request)
    {
        ContentieuxHorsLocation? entity = await context.ContentieuxHorsLocations.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("ContentieuxHorsLocation not found");
        }

        entity.Locataire = request.Locataire;
        entity.CodeLocataire = request.CodeLocataire;
        entity.Immeuble = request.Immeuble;
        entity.LoyerMensuelTTC = request.LoyerMensuelTTC;
        entity.DateDebutImpaye = request.DateDebutImpaye;
        entity.DateFinImpaye = request.DateFinImpaye;
        entity.MontantLoyerImpaye = request.MontantLoyerImpaye;
        entity.Type = request.Type;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("ContentieuxHorsLocation with ID {Id} updated successfully.", id);

        return ToResponse(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        ContentieuxHorsLocation? entity = await context.ContentieuxHorsLocations.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.ContentieuxHorsLocations.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("ContentieuxHorsLocation with ID {Id} deleted successfully.", id);

        return result;
    }
}

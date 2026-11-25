using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Commercialisation;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Commercialisation;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Commercialisation;

public class AgenceImmobiliereService(DbDesignContext context, ILogger<AgenceImmobiliereService> logger) : IAgenceImmobiliereService
{
    private static AgenceImmobiliereResponse ToResponse(AgenceImmobiliere entity) => new()
    {
        Numero = entity.Numero,
        RaisonSocial = entity.RaisonSocial,
        Adresse = entity.Adresse,
        Email = entity.Email,
        Tele = entity.Tele,
        ContactPrincipal = entity.ContactPrincipal,
        TeleContactPrincipal = entity.TeleContactPrincipal,
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
            if (request.PageNumber < 1)
            {
                request.PageNumber = 1;
            }

            if (request.PageSize is < 1 or > 100)
            {
                request.PageSize = 10;
            }

            IQueryable<AgenceImmobiliere> query = context.AgencesImmobilieres.Where(a => !a.Inactif);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.RaisonSocial.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderBy(e => e.RaisonSocial);

            int totalCount = await query.CountAsync();

            List<AgenceImmobiliere> items = await query
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
            logger.LogError("Error fetching AgencesImmobilieres: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<AgenceImmobiliereResponse> GetByIdAsync(int id)
    {
        AgenceImmobiliere? entity = await context.AgencesImmobilieres.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("AgenceImmobiliere not found");
        }

        return ToResponse(entity);
    }

    public async Task<AgenceImmobiliereResponse> CreateAsync(AgenceImmobiliereRequest request)
    {
        var entity = new AgenceImmobiliere
        {
            RaisonSocial = request.RaisonSocial,
            Adresse = request.Adresse,
            Email = request.Email,
            Tele = request.Tele,
            ContactPrincipal = request.ContactPrincipal,
            TeleContactPrincipal = request.TeleContactPrincipal,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.AgencesImmobilieres.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("AgenceImmobiliere with ID {Numero} created successfully.", entity.Numero);

        return ToResponse(entity);
    }

    public async Task<AgenceImmobiliereResponse> UpdateAsync(int id, AgenceImmobiliereRequest request)
    {
        AgenceImmobiliere? entity = await context.AgencesImmobilieres.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("AgenceImmobiliere not found");
        }

        entity.RaisonSocial = request.RaisonSocial;
        entity.Adresse = request.Adresse;
        entity.Email = request.Email;
        entity.Tele = request.Tele;
        entity.ContactPrincipal = request.ContactPrincipal;
        entity.TeleContactPrincipal = request.TeleContactPrincipal;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("AgenceImmobiliere with ID {Id} updated successfully.", id);

        return ToResponse(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        AgenceImmobiliere? entity = await context.AgencesImmobilieres.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("AgenceImmobiliere with ID {Id} deactivated successfully.", id);

        return result;
    }
}

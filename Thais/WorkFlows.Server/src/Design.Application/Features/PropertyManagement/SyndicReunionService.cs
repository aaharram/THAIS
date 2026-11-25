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

public class SyndicReunionService(DbDesignContext context, ILogger<SyndicReunionService> logger) : ISyndicReunionService
{
    private async Task<SyndicReunionResponse> ToResponseAsync(SyndicReunion entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomVille = entity.NoVille is null
            ? null
            : await context.Villes.Where(x => x.Numero == entity.NoVille).Select(x => x.Designation).FirstOrDefaultAsync();

        return ToResponse(entity, nomBuilding, nomVille);
    }

    private static SyndicReunionResponse ToResponse(SyndicReunion entity, string? nomBuilding, string? nomVille) => new()
    {
        Numero = entity.Numero,
        NoBuilding = entity.NoBuilding,
        NomBuilding = nomBuilding,
        Type = entity.Type,
        DateReunion = entity.DateReunion,
        Reglee = entity.Reglee,
        DateReglement = entity.DateReglement,
        NoVille = entity.NoVille,
        NomVille = nomVille,
        NombreQuotePart = entity.NombreQuotePart,
        QuotePartAppelFonds = entity.QuotePartAppelFonds,
        AppelFondsAnnuel = entity.AppelFondsAnnuel,
        PjConvocation = entity.PjConvocation,
        PjPV = entity.PjPV,
        PjAppelFonds = entity.PjAppelFonds,
        Notes = entity.Notes,
        Inactif = entity.Inactif,
        AddUser = entity.AddUser,
        AddDate = entity.AddDate,
        ModUser = entity.ModUser,
        ModDate = entity.ModDate
    };

    private async Task<List<SyndicReunionResponse>> ToResponseListAsync(List<SyndicReunion> items)
    {
        List<int> buildingIds = items.Select(x => x.NoBuilding).Distinct().ToList();
        List<int> villeIds = items.Where(x => x.NoVille != null).Select(x => x.NoVille!.Value).Distinct().ToList();

        Dictionary<int, string> buildings = await context.Buildings.Where(x => buildingIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> villes = await context.Villes.Where(x => villeIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);

        return items.Select(item => ToResponse(
            item,
            buildings.TryGetValue(item.NoBuilding, out string? building) ? building : null,
            item.NoVille != null && villes.TryGetValue(item.NoVille.Value, out string? ville) ? ville : null
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

            IQueryable<SyndicReunion> query = context.SyndicReunions.Where(e => !e.Inactif);

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateReunion);

            List<SyndicReunion> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                List<int> buildingIds = allMatching.Select(e => e.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(e => buildingNames.TryGetValue(e.NoBuilding, out string? name) && name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;

            List<SyndicReunion> items = allMatching
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            List<SyndicReunionResponse> mapped = await ToResponseListAsync(items);

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
            logger.LogError("Error fetching SyndicReunions: {ExMessage}", ex.Message);
            throw;
        }
    }

    // RMANew (ListSyndicImmeuble.vb) : vue niveau immeuble - une ligne par actif ayant au
    // moins une réunion, avec le nombre de quotes-parts de la réunion la plus récente et le
    // compte total de réunions ("Historique").
    public async Task<PagedResult<object>> GetSummaryByBuildingAsync(GetFilterSearchSortRequest request)
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

            List<SyndicReunion> all = await context.SyndicReunions.Where(e => !e.Inactif).ToListAsync();

            List<int> buildingIds = all.Select(e => e.NoBuilding).Distinct().ToList();
            Dictionary<int, string> buildingNames = await context.Buildings
                .Where(b => buildingIds.Contains(b.Numero))
                .ToDictionaryAsync(b => b.Numero, b => b.Designation);

            List<SyndicImmeubleSummaryResponse> summaries = all
                .GroupBy(e => e.NoBuilding)
                .Select(g =>
                {
                    SyndicReunion latest = g.OrderByDescending(e => e.DateReunion ?? DateTime.MinValue)
                        .ThenByDescending(e => e.Numero)
                        .First();

                    return new SyndicImmeubleSummaryResponse
                    {
                        NoBuilding = g.Key,
                        NomBuilding = buildingNames.TryGetValue(g.Key, out string? name) ? name : string.Empty,
                        NombreQuotePart = latest.NombreQuotePart,
                        NombreReunions = g.Count()
                    };
                })
                .ToList();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                summaries = summaries.Where(s => s.NomBuilding.ToLower().Contains(search)).ToList();
            }

            summaries = summaries.OrderBy(s => s.NomBuilding).ToList();

            int totalCount = summaries.Count;

            List<SyndicImmeubleSummaryResponse> items = summaries
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            return new PagedResult<object>
            {
                Items = items.Cast<object>().ToList(),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }
        catch (Exception ex)
        {
            logger.LogError("Error fetching SyndicReunion building summary: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<SyndicReunionResponse> GetByIdAsync(int id)
    {
        SyndicReunion? entity = await context.SyndicReunions.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("SyndicReunion not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<SyndicReunionResponse> CreateAsync(SyndicReunionRequest request)
    {
        var entity = new SyndicReunion
        {
            NoBuilding = request.NoBuilding,
            Type = request.Type,
            DateReunion = request.DateReunion,
            Reglee = request.Reglee,
            DateReglement = request.DateReglement,
            NoVille = request.NoVille,
            NombreQuotePart = request.NombreQuotePart,
            QuotePartAppelFonds = request.QuotePartAppelFonds,
            AppelFondsAnnuel = request.AppelFondsAnnuel,
            PjConvocation = request.PjConvocation,
            PjPV = request.PjPV,
            PjAppelFonds = request.PjAppelFonds,
            Notes = request.Notes,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.SyndicReunions.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("SyndicReunion with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<SyndicReunionResponse> UpdateAsync(int id, SyndicReunionRequest request)
    {
        SyndicReunion? entity = await context.SyndicReunions.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("SyndicReunion not found");
        }

        entity.NoBuilding = request.NoBuilding;
        entity.Type = request.Type;
        entity.DateReunion = request.DateReunion;
        entity.Reglee = request.Reglee;
        entity.DateReglement = request.DateReglement;
        entity.NoVille = request.NoVille;
        entity.NombreQuotePart = request.NombreQuotePart;
        entity.QuotePartAppelFonds = request.QuotePartAppelFonds;
        entity.AppelFondsAnnuel = request.AppelFondsAnnuel;
        entity.PjConvocation = request.PjConvocation;
        entity.PjPV = request.PjPV;
        entity.PjAppelFonds = request.PjAppelFonds;
        entity.Notes = request.Notes;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("SyndicReunion with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        SyndicReunion? entity = await context.SyndicReunions.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("SyndicReunion with ID {Id} deactivated successfully.", id);

        return result;
    }
}

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

public class VncService(DbDesignContext context, ILogger<VncService> logger) : IVncService
{
    private async Task<VncResponse> ToResponseAsync(Vnc entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();

        return new VncResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            MontantVNC = entity.MontantVNC,
            DateVNC = entity.DateVNC,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    // Une ligne par Actif, avec la dernière VNC et le nombre de versions, comme
    // RMANew (ListVNCParActif.GenerateTable). "Provision" et "Valeur Marché" n'ont
    // pas d'équivalent dans Smart-Building (modules Provision / évaluation de
    // marché non repris) : affichés vides plutôt qu'inventés.
    public async Task<PagedResult<object>> GetSummaryAsync(GetFilterSearchSortRequest request)
    {
        if (request.PageNumber < 1)
        {
            request.PageNumber = 1;
        }

        if (request.PageSize is < 1 or > 100)
        {
            request.PageSize = 10;
        }

        List<Vnc> vncs = await context.Vncs.ToListAsync();

        var groups = vncs
            .GroupBy(v => v.NoBuilding)
            .Select(g => new
            {
                NoBuilding = g.Key,
                NombreVersions = g.Count(),
                Latest = g.OrderByDescending(x => x.DateVNC).First()
            })
            .ToList();

        var buildingIds = groups.Select(g => g.NoBuilding).ToList();
        Dictionary<int, Building> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        var buildingTypeIds = buildings.Values.Where(b => b.NoBuildingType != null).Select(b => b.NoBuildingType!.Value).Distinct().ToList();
        Dictionary<int, string> buildingTypes = await context.BuildingTypes
            .Where(x => buildingTypeIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);

        Dictionary<int, int> provisionCounts = await context.Provisions
            .Where(p => buildingIds.Contains(p.NoBuilding))
            .GroupBy(p => p.NoBuilding)
            .Select(g => new { NoBuilding = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.NoBuilding, x => x.Count);

        var summaries = groups
            .Where(g => buildings.ContainsKey(g.NoBuilding) && !buildings[g.NoBuilding].Inactif)
            .Select(g =>
            {
                Building building = buildings[g.NoBuilding];
                string? usage = building.NoBuildingType is null ? null : buildingTypes.GetValueOrDefault(building.NoBuildingType.Value);

                return new VncSummaryResponse
                {
                    NoBuilding = g.NoBuilding,
                    CodeImmeuble = building.CodeImmeuble,
                    NomBuilding = building.Designation,
                    Adresse = building.Address1,
                    Affectation = building.NAffectation,
                    Usage = usage,
                    ValeurBrut = building.ValeurInventaire,
                    DerniereVnc = g.Latest.MontantVNC,
                    DateDerniereVnc = g.Latest.DateVNC,
                    NombreVersions = g.NombreVersions,
                    NombreProvisions = provisionCounts.GetValueOrDefault(g.NoBuilding)
                };
            })
            .ToList();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            string search = request.Search.Trim().ToLower();
            summaries = summaries
                .Where(s => s.NomBuilding.ToLower().Contains(search) || s.CodeImmeuble.ToLower().Contains(search))
                .ToList();
        }

        summaries = summaries.OrderBy(s => s.NomBuilding).ToList();

        int totalCount = summaries.Count;
        List<VncSummaryResponse> page = summaries
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return new PagedResult<object>
        {
            Items = page.Cast<object>().ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
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

            IQueryable<Vnc> query = context.Vncs;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateVNC);

            int totalCount = await query.CountAsync();

            List<Vnc> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<VncResponse>();
            foreach (Vnc item in items)
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
            logger.LogError("Error fetching VNC: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<VncResponse> GetByIdAsync(int id)
    {
        Vnc? entity = await context.Vncs.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("VNC not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<VncResponse> CreateAsync(VncRequest request)
    {
        var entity = new Vnc
        {
            NoBuilding = request.NoBuilding,
            MontantVNC = request.MontantVNC,
            DateVNC = request.DateVNC,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Vncs.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("VNC with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<VncResponse> UpdateAsync(int id, VncRequest request)
    {
        Vnc? entity = await context.Vncs.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("VNC not found");
        }

        entity.NoBuilding = request.NoBuilding;
        entity.MontantVNC = request.MontantVNC;
        entity.DateVNC = request.DateVNC;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("VNC with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Vnc? entity = await context.Vncs.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.Vncs.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("VNC with ID {Id} deleted successfully.", id);

        return result;
    }
}

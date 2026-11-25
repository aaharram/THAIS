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

public class ExpertiseService(DbDesignContext context, ILogger<ExpertiseService> logger) : IExpertiseService
{
    private async Task<ExpertiseResponse> ToResponseAsync(Expertise entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocal = await context.Locaux
            .Where(x => x.Numero == entity.NoLocal).Select(x => x.Designation).FirstOrDefaultAsync();

        return new ExpertiseResponse
        {
            Numero = entity.Numero,
            CabinetExpert = entity.CabinetExpert,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            NoLocal = entity.NoLocal,
            NomLocal = nomLocal,
            ValeurTerrain = entity.ValeurTerrain,
            ValeurConstruction = entity.ValeurConstruction,
            ValeurExpertiseActualiser = entity.ValeurExpertiseActualiser,
            DateExpertiseActualiser = entity.DateExpertiseActualiser,
            PieceJointe = entity.PieceJointe,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    // Une ligne par couple (Actif, Local), avec la dernière expertise et le nombre
    // de versions, comme RMANew (ListExpertiseParTF.GenerateTable).
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

        List<Expertise> expertises = await context.Expertises.ToListAsync();

        var groups = expertises
            .GroupBy(e => new { e.NoBuilding, e.NoLocal })
            .Select(g => new
            {
                g.Key.NoBuilding,
                g.Key.NoLocal,
                NombreVersions = g.Count(),
                Latest = g.OrderByDescending(x => x.DateExpertiseActualiser).First()
            })
            .ToList();

        var buildingIds = groups.Select(g => g.NoBuilding).Distinct().ToList();
        var localIds = groups.Select(g => g.NoLocal).Distinct().ToList();

        Dictionary<int, Building> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);
        Dictionary<int, Local> locaux = await context.Locaux
            .Where(l => localIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        // Filtre "Propriétaire" (liste déroulante, comme RMANew) : Filters[i].Field = NoProprietaire.
        HashSet<int> proprietaireIds = (request.Filters ?? [])
            .Where(f => string.Equals(f.Field, "NoProprietaire", StringComparison.OrdinalIgnoreCase))
            .SelectMany(f => f.Values)
            .Select(v => int.TryParse(v, out int id) ? id : (int?)null)
            .Where(id => id.HasValue)
            .Select(id => id!.Value)
            .ToHashSet();

        var summaries = groups
            .Where(g => buildings.ContainsKey(g.NoBuilding) && !buildings[g.NoBuilding].Inactif)
            .Where(g => proprietaireIds.Count == 0 ||
                        (buildings[g.NoBuilding].NoProprietaire is int p && proprietaireIds.Contains(p)))
            .Select(g =>
            {
                Building building = buildings[g.NoBuilding];
                locaux.TryGetValue(g.NoLocal, out Local? local);

                return new ExpertiseSummaryResponse
                {
                    NoBuilding = g.NoBuilding,
                    NomBuilding = building.Designation,
                    NoLocal = g.NoLocal,
                    NomLocal = local?.Designation,
                    TitreFoncier = building.TitreFoncier,
                    SurfaceUtile = building.SurfaceUtile,
                    ValeurEntree = building.ValeurInventaire,
                    DerniereExpertise = g.Latest.ValeurExpertiseActualiser,
                    DateDerniereExpertise = g.Latest.DateExpertiseActualiser,
                    DerniereExpertiseNumero = g.Latest.Numero,
                    PieceJointe = g.Latest.PieceJointe,
                    NombreVersions = g.NombreVersions
                };
            })
            .ToList();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            string search = request.Search.Trim().ToLower();
            summaries = summaries
                .Where(s => s.NomBuilding.ToLower().Contains(search) ||
                            (s.NomLocal ?? "").ToLower().Contains(search))
                .ToList();
        }

        summaries = summaries.OrderBy(s => s.NomBuilding).ToList();

        int totalCount = summaries.Count;
        List<ExpertiseSummaryResponse> page = summaries
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

            IQueryable<Expertise> query = context.Expertises;

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.CabinetExpert.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateExpertiseActualiser);

            int totalCount = await query.CountAsync();

            List<Expertise> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<ExpertiseResponse>();
            foreach (Expertise item in items)
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
            logger.LogError("Error fetching Expertises: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<ExpertiseResponse> GetByIdAsync(int id)
    {
        Expertise? entity = await context.Expertises.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Expertise not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<ExpertiseResponse> CreateAsync(ExpertiseRequest request)
    {
        var entity = new Expertise
        {
            CabinetExpert = request.CabinetExpert.Trim(),
            NoBuilding = request.NoBuilding,
            NoLocal = request.NoLocal,
            ValeurTerrain = request.ValeurTerrain,
            ValeurConstruction = request.ValeurConstruction,
            ValeurExpertiseActualiser = request.ValeurExpertiseActualiser,
            DateExpertiseActualiser = request.DateExpertiseActualiser,
            PieceJointe = request.PieceJointe,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Expertises.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Expertise with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<ExpertiseResponse> UpdateAsync(int id, ExpertiseRequest request)
    {
        Expertise? entity = await context.Expertises.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Expertise not found");
        }

        entity.CabinetExpert = request.CabinetExpert.Trim();
        entity.NoBuilding = request.NoBuilding;
        entity.NoLocal = request.NoLocal;
        entity.ValeurTerrain = request.ValeurTerrain;
        entity.ValeurConstruction = request.ValeurConstruction;
        entity.ValeurExpertiseActualiser = request.ValeurExpertiseActualiser;
        entity.DateExpertiseActualiser = request.DateExpertiseActualiser;
        entity.PieceJointe = request.PieceJointe;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Expertise with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Expertise? entity = await context.Expertises.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.Expertises.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Expertise with ID {Id} deleted successfully.", id);

        return result;
    }
}

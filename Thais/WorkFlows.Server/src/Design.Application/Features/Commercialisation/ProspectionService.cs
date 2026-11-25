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

public class ProspectionService(DbDesignContext context, ILogger<ProspectionService> logger) : IProspectionService
{
    // Règle métier (ListProspection.vb) : "Nb Biens" n'est pas une valeur saisie, c'est le
    // compte en temps réel des Building rattachés (Building.NoProspection = Prospection.Numero).
    private static ProspectionResponse ToResponse(Prospection entity, int nbBien) => new()
    {
        Numero = entity.Numero,
        Description = entity.Description,
        Typologie = entity.Typologie,
        TypeOperation = entity.TypeOperation,
        SituationProspection = entity.SituationProspection,
        NbBien = nbBien,
        DateAjout = entity.DateAjout,
        DateAdjudication = entity.DateAdjudication,
        DateContrat = entity.DateContrat,
        Notes = entity.Notes,
        Pv = entity.Pv,
        AvisBPP = entity.AvisBPP,
        AvisDPAL = entity.AvisDPAL,
        SupportCA = entity.SupportCA,
        BusinesPlan = entity.BusinesPlan,
        Inactif = entity.Inactif,
        AddUser = entity.AddUser,
        AddDate = entity.AddDate,
        ModUser = entity.ModUser,
        ModDate = entity.ModDate
    };

    private async Task<ProspectionResponse> ToResponseAsync(Prospection entity)
    {
        int nbBien = await context.Buildings.CountAsync(b => !b.Inactif && b.NoProspection == entity.Numero);
        return ToResponse(entity, nbBien);
    }

    private async Task<List<ProspectionResponse>> ToResponseListAsync(List<Prospection> items)
    {
        List<int> numeros = items.Select(p => p.Numero).ToList();
        Dictionary<int, int> counts = await context.Buildings
            .Where(b => !b.Inactif && b.NoProspection != null && numeros.Contains(b.NoProspection.Value))
            .GroupBy(b => b.NoProspection!.Value)
            .Select(g => new { NoProspection = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.NoProspection, x => x.Count);

        return items.Select(p => ToResponse(p, counts.TryGetValue(p.Numero, out int c) ? c : 0)).ToList();
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

            IQueryable<Prospection> query = context.Prospections.Where(p => !p.Inactif);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.Description != null && e.Description.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Numero);

            int totalCount = await query.CountAsync();

            List<Prospection> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            List<ProspectionResponse> mapped = await ToResponseListAsync(items);

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
            logger.LogError("Error fetching Prospections: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<ProspectionResponse> GetByIdAsync(int id)
    {
        Prospection? entity = await context.Prospections.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Prospection not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<ProspectionResponse> CreateAsync(ProspectionRequest request)
    {
        var entity = new Prospection
        {
            Description = request.Description,
            Typologie = request.Typologie,
            TypeOperation = request.TypeOperation,
            SituationProspection = request.SituationProspection,
            DateAjout = request.DateAjout,
            DateAdjudication = request.DateAdjudication,
            DateContrat = request.DateContrat,
            Notes = request.Notes,
            Pv = request.Pv,
            AvisBPP = request.AvisBPP,
            AvisDPAL = request.AvisDPAL,
            SupportCA = request.SupportCA,
            BusinesPlan = request.BusinesPlan,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Prospections.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Prospection with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<ProspectionResponse> UpdateAsync(int id, ProspectionRequest request)
    {
        Prospection? entity = await context.Prospections.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Prospection not found");
        }

        entity.Description = request.Description;
        entity.Typologie = request.Typologie;
        entity.TypeOperation = request.TypeOperation;
        entity.SituationProspection = request.SituationProspection;
        entity.DateAjout = request.DateAjout;
        entity.DateAdjudication = request.DateAdjudication;
        entity.DateContrat = request.DateContrat;
        entity.Notes = request.Notes;
        entity.Pv = request.Pv;
        entity.AvisBPP = request.AvisBPP;
        entity.AvisDPAL = request.AvisDPAL;
        entity.SupportCA = request.SupportCA;
        entity.BusinesPlan = request.BusinesPlan;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Prospection with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Prospection? entity = await context.Prospections.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Prospection with ID {Id} deactivated successfully.", id);

        return result;
    }
}

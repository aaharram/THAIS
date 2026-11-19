using Microsoft.EntityFrameworkCore;
using Design.Application.Common;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Patrimoine;

public class CpcImmobilierService(DbDesignContext context) : ICpcImmobilierService
{
    private async Task<CpcImmobilierResponse> ToResponseAsync(CpcImmobilier entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(b => b.Numero == entity.NoBuilding).Select(b => b.Designation).FirstOrDefaultAsync();

        return new CpcImmobilierResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            Annee = entity.Annee,
            RevenusImmobilierVie = entity.RevenusImmobilierVie,
            RevenusImmobilierNonVie = entity.RevenusImmobilierNonVie,
            PlusValuesImmobilieresVie = entity.PlusValuesImmobilieresVie,
            PlusValuesImmobilieresNonVie = entity.PlusValuesImmobilieresNonVie,
            ReprisesImmobilieresLoyersVie = entity.ReprisesImmobilieresLoyersVie,
            ReprisesImmobilieresLoyersNonVie = entity.ReprisesImmobilieresLoyersNonVie,
            ChargesImmobilieresVie = entity.ChargesImmobilieresVie,
            ChargesImmobilieresNonVie = entity.ChargesImmobilieresNonVie,
            MoinsValuesImmobilieresVie = entity.MoinsValuesImmobilieresVie,
            MoinsValuesImmobilieresNonVie = entity.MoinsValuesImmobilieresNonVie,
            DotationsImmobilieresVie = entity.DotationsImmobilieresVie,
            DotationsImmobilieresNonVie = entity.DotationsImmobilieresNonVie,
            ProvisionsImmobilieresVie = entity.ProvisionsImmobilieresVie,
            ProvisionsImmobilieresNonVie = entity.ProvisionsImmobilieresNonVie,
            ResultatVie = entity.RevenusImmobilierVie + entity.PlusValuesImmobilieresVie + entity.ReprisesImmobilieresLoyersVie
                          - entity.ChargesImmobilieresVie - entity.MoinsValuesImmobilieresVie
                          - entity.DotationsImmobilieresVie - entity.ProvisionsImmobilieresVie,
            ResultatNonVie = entity.RevenusImmobilierNonVie + entity.PlusValuesImmobilieresNonVie + entity.ReprisesImmobilieresLoyersNonVie
                             - entity.ChargesImmobilieresNonVie - entity.MoinsValuesImmobilieresNonVie
                             - entity.DotationsImmobilieresNonVie - entity.ProvisionsImmobilieresNonVie,
            Notes = entity.Notes,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    public async Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request)
    {
        if (request.PageNumber < 1)
        {
            request.PageNumber = 1;
        }

        if (request.PageSize is < 1 or > 100)
        {
            request.PageSize = 10;
        }

        IQueryable<CpcImmobilier> query = context.CpcImmobiliers;
        if (request.Filters != null && request.Filters.Count != 0)
        {
            query = query.ApplyFilters(request.Filters);
        }

        query = !string.IsNullOrWhiteSpace(request.SortField)
            ? query.ApplySorting(request.SortField, request.SortOrder)
            : query.OrderByDescending(e => e.Annee);

        int totalCount = await query.CountAsync();
        List<CpcImmobilier> items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var mapped = new List<CpcImmobilierResponse>();
        foreach (CpcImmobilier item in items)
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

    public async Task<CpcImmobilierResponse> GetByIdAsync(int id)
    {
        CpcImmobilier? entity = await context.CpcImmobiliers.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("CpcImmobilier not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<CpcImmobilierResponse> CreateAsync(CpcImmobilierRequest request)
    {
        bool doublon = await context.CpcImmobiliers
            .AnyAsync(c => c.NoBuilding == request.NoBuilding && c.Annee == request.Annee);
        if (doublon)
        {
            throw new InvalidOperationException("Un CPC existe déjà pour cet actif et cette année.");
        }

        var entity = new CpcImmobilier
        {
            NoBuilding = request.NoBuilding,
            Annee = request.Annee,
            RevenusImmobilierVie = request.RevenusImmobilierVie,
            RevenusImmobilierNonVie = request.RevenusImmobilierNonVie,
            PlusValuesImmobilieresVie = request.PlusValuesImmobilieresVie,
            PlusValuesImmobilieresNonVie = request.PlusValuesImmobilieresNonVie,
            ReprisesImmobilieresLoyersVie = request.ReprisesImmobilieresLoyersVie,
            ReprisesImmobilieresLoyersNonVie = request.ReprisesImmobilieresLoyersNonVie,
            ChargesImmobilieresVie = request.ChargesImmobilieresVie,
            ChargesImmobilieresNonVie = request.ChargesImmobilieresNonVie,
            MoinsValuesImmobilieresVie = request.MoinsValuesImmobilieresVie,
            MoinsValuesImmobilieresNonVie = request.MoinsValuesImmobilieresNonVie,
            DotationsImmobilieresVie = request.DotationsImmobilieresVie,
            DotationsImmobilieresNonVie = request.DotationsImmobilieresNonVie,
            ProvisionsImmobilieresVie = request.ProvisionsImmobilieresVie,
            ProvisionsImmobilieresNonVie = request.ProvisionsImmobilieresNonVie,
            Notes = request.Notes,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.CpcImmobiliers.Add(entity);
        await context.SaveChangesAsync();

        return await ToResponseAsync(entity);
    }

    public async Task<CpcImmobilierResponse> UpdateAsync(int id, CpcImmobilierRequest request)
    {
        CpcImmobilier? entity = await context.CpcImmobiliers.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("CpcImmobilier not found");
        }

        entity.NoBuilding = request.NoBuilding;
        entity.Annee = request.Annee;
        entity.RevenusImmobilierVie = request.RevenusImmobilierVie;
        entity.RevenusImmobilierNonVie = request.RevenusImmobilierNonVie;
        entity.PlusValuesImmobilieresVie = request.PlusValuesImmobilieresVie;
        entity.PlusValuesImmobilieresNonVie = request.PlusValuesImmobilieresNonVie;
        entity.ReprisesImmobilieresLoyersVie = request.ReprisesImmobilieresLoyersVie;
        entity.ReprisesImmobilieresLoyersNonVie = request.ReprisesImmobilieresLoyersNonVie;
        entity.ChargesImmobilieresVie = request.ChargesImmobilieresVie;
        entity.ChargesImmobilieresNonVie = request.ChargesImmobilieresNonVie;
        entity.MoinsValuesImmobilieresVie = request.MoinsValuesImmobilieresVie;
        entity.MoinsValuesImmobilieresNonVie = request.MoinsValuesImmobilieresNonVie;
        entity.DotationsImmobilieresVie = request.DotationsImmobilieresVie;
        entity.DotationsImmobilieresNonVie = request.DotationsImmobilieresNonVie;
        entity.ProvisionsImmobilieresVie = request.ProvisionsImmobilieresVie;
        entity.ProvisionsImmobilieresNonVie = request.ProvisionsImmobilieresNonVie;
        entity.Notes = request.Notes;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return await ToResponseAsync(entity);
    }

    public async Task DeleteAsync(int id)
    {
        CpcImmobilier? entity = await context.CpcImmobiliers.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("CpcImmobilier not found");
        }

        context.CpcImmobiliers.Remove(entity);
        await context.SaveChangesAsync();
    }
}

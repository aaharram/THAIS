using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.PropertyManagement;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.PropertyManagement;
using Design.Infrastructure.Data;

namespace Design.Application.Features.PropertyManagement;

public class TaxeService(DbDesignContext context, ILogger<TaxeService> logger) : ITaxeService
{
    private async Task<string?> ResolveNomLocataireAsync(int? noLocataire)
    {
        if (noLocataire is null) return null;
        Locataire? locataire = await context.Locataires.FindAsync(noLocataire.Value);
        if (locataire == null) return null;

        return locataire.TypeLocataire == 1
            ? locataire.DesignationEntreprise
            : $"{locataire.Nom} {locataire.Prenom}".Trim();
    }

    private async Task<TaxeResponse> ToResponseAsync(Taxe entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocal = entity.NoLocal is null
            ? null
            : await context.Locaux.Where(x => x.Numero == entity.NoLocal).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomType = await context.TypesTaxe
            .Where(x => x.Numero == entity.NoType).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocataire = await ResolveNomLocataireAsync(entity.NoLocataire);

        return new TaxeResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            NoLocal = entity.NoLocal,
            NomLocal = nomLocal,
            NoLocataire = entity.NoLocataire,
            NomLocataire = nomLocataire,
            NoType = entity.NoType,
            NomType = nomType,
            IdFiscal = entity.IdFiscal,
            NoArticle = entity.NoArticle,
            MontantTaxe = entity.MontantTaxe,
            Annee = entity.Annee,
            Paye = entity.Paye,
            Notes = entity.Notes,
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
            if (request.PageNumber < 1) request.PageNumber = 1;
            if (request.PageSize is < 1 or > 100) request.PageSize = 10;

            IQueryable<Taxe> query = context.Taxes.Where(e => !e.Inactif);

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Annee);

            List<Taxe> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var buildingIds = allMatching.Select(t => t.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(t => buildingNames.TryGetValue(t.NoBuilding, out string? name) && name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;
            List<Taxe> items = allMatching.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToList();

            var mapped = new List<TaxeResponse>();
            foreach (Taxe item in items)
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
            logger.LogError("Error fetching Taxes: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<TaxeResponse> GetByIdAsync(int id)
    {
        Taxe? entity = await context.Taxes.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Taxe not found");
        return await ToResponseAsync(entity);
    }

    public async Task<TaxeResponse> CreateAsync(TaxeRequest request)
    {
        var entity = new Taxe
        {
            NoBuilding = request.NoBuilding,
            NoLocal = request.NoLocal,
            NoLocataire = request.NoLocataire,
            NoType = request.NoType,
            IdFiscal = request.IdFiscal,
            NoArticle = request.NoArticle,
            MontantTaxe = request.MontantTaxe,
            Annee = request.Annee,
            Paye = request.Paye,
            Notes = request.Notes,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Taxes.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Taxe with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<TaxeResponse> UpdateAsync(int id, TaxeRequest request)
    {
        Taxe? entity = await context.Taxes.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Taxe not found");

        entity.NoBuilding = request.NoBuilding;
        entity.NoLocal = request.NoLocal;
        entity.NoLocataire = request.NoLocataire;
        entity.NoType = request.NoType;
        entity.IdFiscal = request.IdFiscal;
        entity.NoArticle = request.NoArticle;
        entity.MontantTaxe = request.MontantTaxe;
        entity.Annee = request.Annee;
        entity.Paye = request.Paye;
        entity.Notes = request.Notes;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Taxe with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Taxe? entity = await context.Taxes.FindAsync(id);
        if (entity == null) return 0;

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Taxe with ID {Id} deactivated successfully.", id);

        return result;
    }
}

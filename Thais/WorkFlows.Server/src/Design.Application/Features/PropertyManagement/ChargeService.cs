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

public class ChargeService(DbDesignContext context, ILogger<ChargeService> logger) : IChargeService
{
    private async Task<ChargeResponse> ToResponseAsync(Charge entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomTypologie = await context.TypologiesCharge
            .Where(x => x.Numero == entity.NoTypologieCharge).Select(x => x.Typologie).FirstOrDefaultAsync();
        string? nomPrestataire = entity.NoPrestataire is null
            ? null
            : await context.Prestataires.Where(x => x.Numero == entity.NoPrestataire).Select(x => x.Designation).FirstOrDefaultAsync();

        return new ChargeResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            NoTypologieCharge = entity.NoTypologieCharge,
            NomTypologieCharge = nomTypologie,
            NoPrestataire = entity.NoPrestataire,
            NomPrestataire = nomPrestataire,
            Annee = entity.Annee,
            Montant = entity.Montant,
            Realisation = entity.Realisation,
            Ecart = entity.Realisation.HasValue && entity.Montant.HasValue ? entity.Realisation - entity.Montant : null,
            DateDecaissement = entity.DateDecaissement,
            CodeCharge = entity.CodeCharge,
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

            IQueryable<Charge> query = context.Charges.Where(e => !e.Inactif);

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Annee);

            List<Charge> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var buildingIds = allMatching.Select(c => c.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(c => buildingNames.TryGetValue(c.NoBuilding, out string? name) && name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;
            List<Charge> items = allMatching.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToList();

            var mapped = new List<ChargeResponse>();
            foreach (Charge item in items)
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
            logger.LogError("Error fetching Charges: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<ChargeResponse> GetByIdAsync(int id)
    {
        Charge? entity = await context.Charges.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Charge not found");
        return await ToResponseAsync(entity);
    }

    // RMANew (DataEntryChargePrevues.AfterSave) : CodeCharge = "CH" + Numero, généré
    // seulement après le premier enregistrement (l'identifiant n'existe pas avant).
    public async Task<ChargeResponse> CreateAsync(ChargeRequest request)
    {
        var entity = new Charge
        {
            NoBuilding = request.NoBuilding,
            NoTypologieCharge = request.NoTypologieCharge,
            NoPrestataire = request.NoPrestataire,
            Annee = request.Annee,
            Montant = request.Montant,
            Realisation = request.Realisation,
            DateDecaissement = request.DateDecaissement,
            Notes = request.Notes,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Charges.Add(entity);
        await context.SaveChangesAsync();

        entity.CodeCharge = $"CH{entity.Numero}";
        await context.SaveChangesAsync();

        logger.LogInformation("Charge with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<ChargeResponse> UpdateAsync(int id, ChargeRequest request)
    {
        Charge? entity = await context.Charges.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Charge not found");

        entity.NoBuilding = request.NoBuilding;
        entity.NoTypologieCharge = request.NoTypologieCharge;
        entity.NoPrestataire = request.NoPrestataire;
        entity.Annee = request.Annee;
        entity.Montant = request.Montant;
        entity.Realisation = request.Realisation;
        entity.DateDecaissement = request.DateDecaissement;
        entity.Notes = request.Notes;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Charge with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Charge? entity = await context.Charges.FindAsync(id);
        if (entity == null) return 0;

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Charge with ID {Id} deactivated successfully.", id);

        return result;
    }
}

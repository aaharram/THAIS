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

public class PrestationAchatService(DbDesignContext context, ILogger<PrestationAchatService> logger) : IPrestationAchatService
{
    private async Task<PrestationAchatResponse> ToResponseAsync(PrestationAchat entity)
    {
        BonDeCommande? bon = await context.BonsDeCommande.FindAsync(entity.NoBonCommande);
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomTypologie = await context.TypologiesCharge
            .Where(x => x.Numero == entity.NoTypologieCharge).Select(x => x.Typologie).FirstOrDefaultAsync();

        decimal montantHT = entity.PrixUnitaireHT * entity.Quantite;
        decimal montantTTC = montantHT + (entity.TauxTVA.HasValue ? montantHT * (entity.TauxTVA.Value / 100m) : 0);

        return new PrestationAchatResponse
        {
            Numero = entity.Numero,
            NoBonCommande = entity.NoBonCommande,
            NumeroBonCommande = bon?.NumeroBonCommande,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            NoTypologieCharge = entity.NoTypologieCharge,
            NomTypologieCharge = nomTypologie,
            PrixUnitaireHT = entity.PrixUnitaireHT,
            Quantite = entity.Quantite,
            TauxTVA = entity.TauxTVA,
            MontantTTC = montantTTC,
            DureeAmortissementMois = entity.DureeAmortissementMois,
            TauxAmortissement = entity.TauxAmortissement,
            EstAmorti = entity.EstAmorti,
            EligibleAmortissement = bon?.CompteComptable != null && bon.CompteComptable.StartsWith('2'),
            Notes = entity.Notes,
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

            IQueryable<PrestationAchat> query = context.PrestationsAchat;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Numero);

            List<PrestationAchat> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var buildingIds = allMatching.Select(p => p.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(p => buildingNames.TryGetValue(p.NoBuilding, out string? name) && name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;
            List<PrestationAchat> items = allMatching.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToList();

            var mapped = new List<PrestationAchatResponse>();
            foreach (PrestationAchat item in items)
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
            logger.LogError("Error fetching PrestationsAchat: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<PrestationAchatResponse> GetByIdAsync(int id)
    {
        PrestationAchat? entity = await context.PrestationsAchat.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("PrestationAchat not found");
        return await ToResponseAsync(entity);
    }

    public async Task<PrestationAchatResponse> CreateAsync(PrestationAchatRequest request)
    {
        BonDeCommande? bon = await context.BonsDeCommande.FindAsync(request.NoBonCommande);
        if (bon == null)
        {
            throw new KeyNotFoundException("BonDeCommande not found");
        }

        var entity = new PrestationAchat
        {
            NoBonCommande = request.NoBonCommande,
            NoBuilding = request.NoBuilding,
            NoTypologieCharge = request.NoTypologieCharge,
            PrixUnitaireHT = request.PrixUnitaireHT,
            Quantite = request.Quantite ?? 1,
            TauxTVA = request.TauxTVA,
            Notes = request.Notes,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.PrestationsAchat.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("PrestationAchat with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<PrestationAchatResponse> UpdateAsync(int id, PrestationAchatRequest request)
    {
        PrestationAchat? entity = await context.PrestationsAchat.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("PrestationAchat not found");

        entity.NoBonCommande = request.NoBonCommande;
        entity.NoBuilding = request.NoBuilding;
        entity.NoTypologieCharge = request.NoTypologieCharge;
        entity.PrixUnitaireHT = request.PrixUnitaireHT;
        entity.Quantite = request.Quantite ?? entity.Quantite;
        entity.TauxTVA = request.TauxTVA;
        entity.Notes = request.Notes;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("PrestationAchat with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    // RMANew (ListPrestations.vb) : disponible seulement si CompteComptable du bon de
    // commande commence par "2" et IsAmorti=0. Génère une ligne TableauAmortissement -
    // ici on se contente de marquer la prestation amortie avec ses paramètres ; la
    // création de l'écriture d'amortissement dans le module Patrimoine reste un point
    // d'intégration à faire dans une passe ultérieure (hors périmètre de ce bloc).
    public async Task<PrestationAchatResponse> AmortirAsync(int id, int dureeMois, decimal? taux)
    {
        PrestationAchat? entity = await context.PrestationsAchat.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("PrestationAchat not found");

        if (entity.EstAmorti)
        {
            throw new InvalidOperationException("Cette prestation est déjà amortie.");
        }

        BonDeCommande? bon = await context.BonsDeCommande.FindAsync(entity.NoBonCommande);
        bool eligible = bon?.CompteComptable != null && bon.CompteComptable.StartsWith('2');
        if (!eligible)
        {
            throw new InvalidOperationException("Cette prestation n'est pas éligible à l'amortissement (compte comptable du bon de commande hors classe 2).");
        }

        entity.DureeAmortissementMois = dureeMois;
        entity.TauxAmortissement = taux;
        entity.EstAmorti = true;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("PrestationAchat with ID {Id} marked as amortized.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        PrestationAchat? entity = await context.PrestationsAchat.FindAsync(id);
        if (entity == null) return 0;

        context.PrestationsAchat.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("PrestationAchat with ID {Id} deleted successfully.", id);

        return result;
    }
}

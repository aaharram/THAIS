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

public class BonDeCommandeService(DbDesignContext context, ILogger<BonDeCommandeService> logger) : IBonDeCommandeService
{
    private async Task<BonDeCommandeResponse> ToResponseAsync(BonDeCommande entity)
    {
        string? nomPrestataire = await context.Prestataires
            .Where(x => x.Numero == entity.NoPrestataire).Select(x => x.Designation).FirstOrDefaultAsync();

        return new BonDeCommandeResponse
        {
            Numero = entity.Numero,
            NumeroBonCommande = entity.NumeroBonCommande,
            NoPrestataire = entity.NoPrestataire,
            NomPrestataire = nomPrestataire,
            DateCommande = entity.DateCommande,
            DateReception = entity.DateReception,
            Compte = entity.Compte,
            CompteComptable = entity.CompteComptable,
            StatutApprobation = entity.StatutApprobation,
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

            IQueryable<BonDeCommande> query = context.BonsDeCommande;

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.NumeroBonCommande.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateCommande);

            int totalCount = await query.CountAsync();
            List<BonDeCommande> items = await query.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToListAsync();

            var mapped = new List<BonDeCommandeResponse>();
            foreach (BonDeCommande item in items)
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
            logger.LogError("Error fetching BonsDeCommande: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<BonDeCommandeResponse> GetByIdAsync(int id)
    {
        BonDeCommande? entity = await context.BonsDeCommande.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("BonDeCommande not found");
        return await ToResponseAsync(entity);
    }

    // RMANew (ImportBonDeCommande.vb) : IdAchat (numéro de BC) est la clé métier de
    // déduplication à l'import - on la garde unique ici aussi.
    public async Task<BonDeCommandeResponse> CreateAsync(BonDeCommandeRequest request)
    {
        bool doublon = await context.BonsDeCommande.AnyAsync(b => b.NumeroBonCommande == request.NumeroBonCommande);
        if (doublon)
        {
            throw new InvalidOperationException("Un bon de commande avec ce numéro existe déjà.");
        }

        var entity = new BonDeCommande
        {
            NumeroBonCommande = request.NumeroBonCommande.Trim(),
            NoPrestataire = request.NoPrestataire,
            DateCommande = request.DateCommande,
            DateReception = request.DateReception,
            Compte = request.Compte,
            CompteComptable = request.CompteComptable,
            StatutApprobation = string.IsNullOrWhiteSpace(request.StatutApprobation) ? "En attente" : request.StatutApprobation,
            Notes = request.Notes,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.BonsDeCommande.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("BonDeCommande with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<BonDeCommandeResponse> UpdateAsync(int id, BonDeCommandeRequest request)
    {
        BonDeCommande? entity = await context.BonsDeCommande.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("BonDeCommande not found");

        entity.NumeroBonCommande = request.NumeroBonCommande.Trim();
        entity.NoPrestataire = request.NoPrestataire;
        entity.DateCommande = request.DateCommande;
        entity.DateReception = request.DateReception;
        entity.Compte = request.Compte;
        entity.CompteComptable = request.CompteComptable;
        entity.StatutApprobation = string.IsNullOrWhiteSpace(request.StatutApprobation) ? entity.StatutApprobation : request.StatutApprobation;
        entity.Notes = request.Notes;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("BonDeCommande with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    // RMANew (ImportBonDeCommande.vb, Importer()) : import en masse depuis Excel. Une
    // ligne dont le "Numéro BC" existe déjà est ignorée (comme RMANew, mais rapportée ici
    // plutôt que silencieusement sautée) ; une ligne dont le Fournisseur ne correspond à
    // aucun Prestataire existant est rejetée (voir commentaire sur BonDeCommandeImportRow -
    // pas d'auto-création comme RMANew).
    public async Task<BonDeCommandeImportResult> ImportAsync(BonDeCommandeImportRequest request)
    {
        var result = new BonDeCommandeImportResult();
        int addUser = request.AddUser ?? 0;

        List<Prestataire> prestataires = await context.Prestataires.ToListAsync();
        HashSet<string> numerosExistants = (await context.BonsDeCommande.Select(b => b.NumeroBonCommande).ToListAsync())
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        for (int i = 0; i < request.Rows.Count; i++)
        {
            BonDeCommandeImportRow row = request.Rows[i];
            int ligne = i + 1;

            if (numerosExistants.Contains(row.NumeroBonCommande))
            {
                result.Erreurs.Add(new BonDeCommandeImportError
                {
                    Ligne = ligne,
                    Motif = $"Numéro BC déjà existant : \"{row.NumeroBonCommande}\""
                });
                continue;
            }

            Prestataire? prestataire = prestataires.FirstOrDefault(p =>
                string.Equals(p.Designation, row.NomFournisseur, StringComparison.OrdinalIgnoreCase));
            if (prestataire == null)
            {
                result.Erreurs.Add(new BonDeCommandeImportError
                {
                    Ligne = ligne,
                    Motif = $"Fournisseur introuvable : \"{row.NomFournisseur}\""
                });
                continue;
            }

            var entity = new BonDeCommande
            {
                NumeroBonCommande = row.NumeroBonCommande.Trim(),
                NoPrestataire = prestataire.Numero,
                DateCommande = row.DateCommande,
                DateReception = row.DateReception,
                Compte = row.Compte,
                CompteComptable = row.CompteComptable,
                StatutApprobation = string.IsNullOrWhiteSpace(row.StatutApprobation) ? "En attente" : row.StatutApprobation,
                AddUser = addUser,
                AddDate = DateTime.UtcNow,
                ModUser = addUser,
                ModDate = DateTime.UtcNow
            };

            context.BonsDeCommande.Add(entity);
            numerosExistants.Add(entity.NumeroBonCommande);
            result.Importes++;
        }

        await context.SaveChangesAsync();

        logger.LogInformation("Imported {Count} BonDeCommande rows ({Errors} errors).", result.Importes, result.Erreurs.Count);

        return result;
    }

    public async Task<int> DeleteAsync(int id)
    {
        BonDeCommande? entity = await context.BonsDeCommande.FindAsync(id);
        if (entity == null) return 0;

        bool aDesPrestations = await context.PrestationsAchat.AnyAsync(p => p.NoBonCommande == id);
        if (aDesPrestations)
        {
            throw new InvalidOperationException("Impossible de supprimer un bon de commande ayant des prestations rattachées.");
        }

        context.BonsDeCommande.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("BonDeCommande with ID {Id} deleted successfully.", id);

        return result;
    }
}

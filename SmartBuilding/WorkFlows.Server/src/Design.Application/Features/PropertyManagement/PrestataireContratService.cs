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

public class PrestataireContratService(DbDesignContext context, ILogger<PrestataireContratService> logger) : IPrestataireContratService
{
    private async Task<PrestataireContratResponse> ToResponseAsync(PrestataireContrat entity)
    {
        string? nomPrestataire = await context.Prestataires
            .Where(x => x.Numero == entity.NoPrestataire).Select(x => x.Designation).FirstOrDefaultAsync();

        return ToResponse(entity, nomPrestataire);
    }

    private static PrestataireContratResponse ToResponse(PrestataireContrat entity, string? nomPrestataire) => new()
    {
        Numero = entity.Numero,
        NoPrestataire = entity.NoPrestataire,
        NomPrestataire = nomPrestataire,
        NumeroContrat = entity.NumeroContrat,
        Objet = entity.Objet,
        DateContrat = entity.DateContrat,
        DateDebut = entity.DateDebut,
        DateFin = entity.DateFin,
        Montant = entity.Montant,
        PieceJointe = entity.PieceJointe,
        Notes = entity.Notes,
        Inactif = entity.Inactif,
        AddUser = entity.AddUser,
        AddDate = entity.AddDate,
        ModUser = entity.ModUser,
        ModDate = entity.ModDate
    };

    private async Task<List<PrestataireContratResponse>> ToResponseListAsync(List<PrestataireContrat> items)
    {
        List<int> prestataireIds = items.Select(x => x.NoPrestataire).Distinct().ToList();
        Dictionary<int, string> prestataires = await context.Prestataires
            .Where(x => prestataireIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);

        return items.Select(item => ToResponse(
            item,
            prestataires.TryGetValue(item.NoPrestataire, out string? nom) ? nom : null
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

            IQueryable<PrestataireContrat> query = context.PrestataireContrats.Where(e => !e.Inactif);

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateContrat);

            List<PrestataireContrat> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                List<int> prestataireIds = allMatching.Select(e => e.NoPrestataire).Distinct().ToList();
                Dictionary<int, string> prestataireNames = await context.Prestataires
                    .Where(p => prestataireIds.Contains(p.Numero))
                    .ToDictionaryAsync(p => p.Numero, p => p.Designation);

                allMatching = allMatching
                    .Where(e => prestataireNames.TryGetValue(e.NoPrestataire, out string? name) && name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;

            List<PrestataireContrat> items = allMatching
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            List<PrestataireContratResponse> mapped = await ToResponseListAsync(items);

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
            logger.LogError("Error fetching PrestataireContrats: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<PrestataireContratResponse> GetByIdAsync(int id)
    {
        PrestataireContrat? entity = await context.PrestataireContrats.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("PrestataireContrat not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<PrestataireContratResponse> CreateAsync(PrestataireContratRequest request)
    {
        var entity = new PrestataireContrat
        {
            NoPrestataire = request.NoPrestataire,
            Objet = request.Objet,
            DateContrat = request.DateContrat,
            DateDebut = request.DateDebut,
            DateFin = request.DateFin,
            Montant = request.Montant,
            PieceJointe = request.PieceJointe,
            Notes = request.Notes,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.PrestataireContrats.Add(entity);
        await context.SaveChangesAsync();

        // RMANew (DataEntryPrestataireContrat.vb) : le numéro de contrat "CNTR<id>" est
        // généré après coup, une fois l'identifiant connu.
        entity.NumeroContrat = $"CNTR{entity.Numero}";
        await context.SaveChangesAsync();

        logger.LogInformation("PrestataireContrat with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<PrestataireContratResponse> UpdateAsync(int id, PrestataireContratRequest request)
    {
        PrestataireContrat? entity = await context.PrestataireContrats.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("PrestataireContrat not found");
        }

        entity.NoPrestataire = request.NoPrestataire;
        entity.Objet = request.Objet;
        entity.DateContrat = request.DateContrat;
        entity.DateDebut = request.DateDebut;
        entity.DateFin = request.DateFin;
        entity.Montant = request.Montant;
        entity.PieceJointe = request.PieceJointe;
        entity.Notes = request.Notes;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("PrestataireContrat with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        PrestataireContrat? entity = await context.PrestataireContrats.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("PrestataireContrat with ID {Id} deactivated successfully.", id);

        return result;
    }
}

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

public class ReclamationService(DbDesignContext context, ILogger<ReclamationService> logger) : IReclamationService
{
    private async Task<string?> ResolveNomLocataireAsync(int noLocataire)
    {
        Locataire? locataire = await context.Locataires.FindAsync(noLocataire);
        if (locataire == null) return null;

        return locataire.TypeLocataire == 1
            ? locataire.DesignationEntreprise
            : $"{locataire.Nom} {locataire.Prenom}".Trim();
    }

    private async Task<ReclamationResponse> ToResponseAsync(Reclamation entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocal = entity.NoLocal is null
            ? null
            : await context.Locaux.Where(x => x.Numero == entity.NoLocal).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocataire = await ResolveNomLocataireAsync(entity.NoLocataire);

        return new ReclamationResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            NoLocal = entity.NoLocal,
            NomLocal = nomLocal,
            NoLocataire = entity.NoLocataire,
            NomLocataire = nomLocataire,
            Etat = entity.Etat,
            DateReclamation = entity.DateReclamation,
            Objet = entity.Objet,
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

            IQueryable<Reclamation> query = context.Reclamations;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateReclamation);

            List<Reclamation> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var buildingIds = allMatching.Select(r => r.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(r => buildingNames.TryGetValue(r.NoBuilding, out string? name) && name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;
            List<Reclamation> items = allMatching.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToList();

            var mapped = new List<ReclamationResponse>();
            foreach (Reclamation item in items)
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
            logger.LogError("Error fetching Reclamations: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<ReclamationResponse> GetByIdAsync(int id)
    {
        Reclamation? entity = await context.Reclamations.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Reclamation not found");
        return await ToResponseAsync(entity);
    }

    public async Task<ReclamationResponse> CreateAsync(ReclamationRequest request)
    {
        var entity = new Reclamation
        {
            NoBuilding = request.NoBuilding,
            NoLocal = request.NoLocal,
            NoLocataire = request.NoLocataire,
            Etat = string.IsNullOrWhiteSpace(request.Etat) ? "Ouverte" : request.Etat,
            DateReclamation = request.DateReclamation ?? DateTime.UtcNow,
            Objet = request.Objet,
            Notes = request.Notes,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Reclamations.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Reclamation with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<ReclamationResponse> UpdateAsync(int id, ReclamationRequest request)
    {
        Reclamation? entity = await context.Reclamations.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Reclamation not found");

        entity.NoBuilding = request.NoBuilding;
        entity.NoLocal = request.NoLocal;
        entity.NoLocataire = request.NoLocataire;
        entity.Etat = string.IsNullOrWhiteSpace(request.Etat) ? entity.Etat : request.Etat;
        entity.DateReclamation = request.DateReclamation;
        entity.Objet = request.Objet;
        entity.Notes = request.Notes;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Reclamation with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Reclamation? entity = await context.Reclamations.FindAsync(id);
        if (entity == null) return 0;

        context.Reclamations.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Reclamation with ID {Id} deleted successfully.", id);

        return result;
    }
}

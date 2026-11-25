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

public class PrestataireService(DbDesignContext context, ILogger<PrestataireService> logger) : IPrestataireService
{
    private async Task<PrestataireResponse> ToResponseAsync(Prestataire entity)
    {
        string? nomVille = entity.NoVille is null
            ? null
            : await context.Villes.Where(x => x.Numero == entity.NoVille).Select(x => x.Designation).FirstOrDefaultAsync();

        return ToResponse(entity, nomVille);
    }

    private static PrestataireResponse ToResponse(Prestataire entity, string? nomVille) => new()
    {
        Numero = entity.Numero,
        Designation = entity.Designation,
        Activite = entity.Activite,
        TypePrestataire = entity.TypePrestataire,
        Enseigne = entity.Enseigne,
        Rc = entity.Rc,
        Idf = entity.Idf,
        Ice = entity.Ice,
        Adresse = entity.Adresse,
        PostalCode = entity.PostalCode,
        NoVille = entity.NoVille,
        NomVille = nomVille,
        Pays = entity.Pays,
        Notes = entity.Notes,
        AddUser = entity.AddUser,
        AddDate = entity.AddDate,
        ModUser = entity.ModUser,
        ModDate = entity.ModDate
    };

    private async Task<List<PrestataireResponse>> ToResponseListAsync(List<Prestataire> items)
    {
        List<int> villeIds = items.Where(x => x.NoVille != null).Select(x => x.NoVille!.Value).Distinct().ToList();
        Dictionary<int, string> villes = await context.Villes.Where(x => villeIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);

        return items.Select(item => ToResponse(
            item,
            item.NoVille != null && villes.TryGetValue(item.NoVille.Value, out string? ville) ? ville : null
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

            IQueryable<Prestataire> query = context.Prestataires;

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e =>
                    e.Designation.ToLower().Contains(search) ||
                    e.Ice.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderBy(e => e.Designation);

            int totalCount = await query.CountAsync();

            List<Prestataire> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            List<PrestataireResponse> mapped = await ToResponseListAsync(items);

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
            logger.LogError("Error fetching Prestataires: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<PrestataireResponse> GetByIdAsync(int id)
    {
        Prestataire? entity = await context.Prestataires.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Prestataire not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<PrestataireResponse> CreateAsync(PrestataireRequest request)
    {
        var entity = new Prestataire
        {
            Designation = request.Designation,
            Activite = request.Activite ?? string.Empty,
            TypePrestataire = request.TypePrestataire ?? string.Empty,
            Enseigne = request.Enseigne ?? string.Empty,
            Rc = request.Rc ?? string.Empty,
            Idf = request.Idf ?? string.Empty,
            Ice = request.Ice ?? string.Empty,
            Adresse = request.Adresse ?? string.Empty,
            PostalCode = request.PostalCode ?? string.Empty,
            NoVille = request.NoVille,
            Pays = request.Pays ?? string.Empty,
            Notes = request.Notes ?? string.Empty,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Prestataires.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Prestataire with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<PrestataireResponse> UpdateAsync(int id, PrestataireRequest request)
    {
        Prestataire? entity = await context.Prestataires.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Prestataire not found");
        }

        entity.Designation = request.Designation;
        entity.Activite = request.Activite ?? string.Empty;
        entity.TypePrestataire = request.TypePrestataire ?? string.Empty;
        entity.Enseigne = request.Enseigne ?? string.Empty;
        entity.Rc = request.Rc ?? string.Empty;
        entity.Idf = request.Idf ?? string.Empty;
        entity.Ice = request.Ice ?? string.Empty;
        entity.Adresse = request.Adresse ?? string.Empty;
        entity.PostalCode = request.PostalCode ?? string.Empty;
        entity.NoVille = request.NoVille;
        entity.Pays = request.Pays ?? string.Empty;
        entity.Notes = request.Notes ?? string.Empty;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Prestataire with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    // RMANew (DataEntryPrestataires.vb) : aucune logique de suppression protégée ni de
    // statut actif/inactif trouvée sur Fournisseur - suppression physique conservée à
    // l'identique (la table ne porte d'ailleurs pas de colonne Inactif).
    public async Task<int> DeleteAsync(int id)
    {
        Prestataire? entity = await context.Prestataires.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.Prestataires.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Prestataire with ID {Id} deleted successfully.", id);

        return result;
    }
}

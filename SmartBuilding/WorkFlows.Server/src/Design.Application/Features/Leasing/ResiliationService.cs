using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Leasing;

public class ResiliationService(DbDesignContext context, ILogger<ResiliationService> logger) : IResiliationService
{
    private async Task<ResiliationResponse> ToResponseAsync(Resiliation entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();

        Bail? bail = await context.Baux.FindAsync(entity.NoContrat);
        string? nomLocataire = null;
        string? etage = null;
        if (bail != null)
        {
            etage = await context.Locaux.Where(x => x.Numero == bail.NoLocal).Select(x => x.Etage).FirstOrDefaultAsync();
            Locataire? locataire = await context.Locataires.FindAsync(bail.NoLocataire);
            if (locataire != null)
            {
                nomLocataire = locataire.TypeLocataire == 1
                    ? locataire.DesignationEntreprise
                    : $"{locataire.Nom} {locataire.Prenom}".Trim();
            }
        }

        return new ResiliationResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            NoContrat = entity.NoContrat,
            NumContratLocations = bail?.NumContratLocations,
            NomLocataire = nomLocataire,
            DateDebutLocation = bail?.DateDebut,
            Etage = etage,
            LoyerMensuel = bail?.Montant,
            TypeResiliation = entity.TypeResiliation,
            MotifResiliation = entity.MotifResiliation,
            DurePreavis = entity.DurePreavis,
            OrigineResiliation = entity.OrigineResiliation,
            StatutValidation = entity.StatutValidation,
            DateResiliation = entity.DateResiliation,
            DateReception = entity.DateReception,
            DateRestitutionActif = entity.DateRestitutionActif,
            Inactif = entity.Inactif,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    // RMANew (DataEntryResiliation.vb) referme le bail (Location.EtatLocation=0) à la
    // sauvegarde d'une résiliation. On reproduit ça sur notre Bail.Etat.
    private async Task CloreBailAsync(int noContrat)
    {
        Bail? bail = await context.Baux.FindAsync(noContrat);
        if (bail == null)
        {
            return;
        }

        bail.Etat = "Location Terminée";
        bail.ModDate = DateTime.UtcNow;
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

            IQueryable<Resiliation> query = context.Resiliations.Where(r => !r.Inactif);

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Numero);

            int totalCount = await query.CountAsync();

            List<Resiliation> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<ResiliationResponse>();
            foreach (Resiliation item in items)
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
            logger.LogError("Error fetching Resiliations: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<ResiliationResponse> GetByIdAsync(int id)
    {
        Resiliation? entity = await context.Resiliations.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Resiliation not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<ResiliationResponse> CreateAsync(ResiliationRequest request)
    {
        var entity = new Resiliation
        {
            NoBuilding = request.NoBuilding,
            NoContrat = request.NoContrat,
            TypeResiliation = request.TypeResiliation,
            MotifResiliation = request.MotifResiliation,
            DurePreavis = request.DurePreavis,
            OrigineResiliation = request.OrigineResiliation,
            StatutValidation = request.StatutValidation,
            DateResiliation = request.DateResiliation,
            DateReception = request.DateReception,
            DateRestitutionActif = request.DateRestitutionActif,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Resiliations.Add(entity);
        await CloreBailAsync(entity.NoContrat);
        await context.SaveChangesAsync();

        logger.LogInformation("Resiliation with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<ResiliationResponse> UpdateAsync(int id, ResiliationRequest request)
    {
        Resiliation? entity = await context.Resiliations.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Resiliation not found");
        }

        entity.NoBuilding = request.NoBuilding;
        entity.NoContrat = request.NoContrat;
        entity.TypeResiliation = request.TypeResiliation;
        entity.MotifResiliation = request.MotifResiliation;
        entity.DurePreavis = request.DurePreavis;
        entity.OrigineResiliation = request.OrigineResiliation;
        entity.StatutValidation = request.StatutValidation;
        entity.DateResiliation = request.DateResiliation;
        entity.DateReception = request.DateReception;
        entity.DateRestitutionActif = request.DateRestitutionActif;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Resiliation with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Resiliation? entity = await context.Resiliations.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Resiliation with ID {Id} deactivated successfully.", id);

        return result;
    }
}

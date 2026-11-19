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

public class AttestationService(DbDesignContext context, ILogger<AttestationService> logger) : IAttestationService
{
    private async Task<AttestationResponse> ToResponseAsync(Attestation entity)
    {
        Bail? bail = await context.Baux.FindAsync(entity.NoLocation);
        string? nomBuilding = bail is null
            ? null
            : await context.Buildings.Where(x => x.Numero == bail.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();

        Locataire? locataire = await context.Locataires.FindAsync(entity.NoLocataire);
        string? nomLocataire = locataire is null
            ? null
            : locataire.TypeLocataire == 1
                ? locataire.DesignationEntreprise
                : $"{locataire.Nom} {locataire.Prenom}".Trim();

        return new AttestationResponse
        {
            Numero = entity.Numero,
            NoLocation = entity.NoLocation,
            NumContratLocations = bail?.NumContratLocations,
            NomBuilding = nomBuilding,
            NoLocataire = entity.NoLocataire,
            NomLocataire = nomLocataire,
            TypeAttestation = entity.TypeAttestation,
            DateAttestation = entity.DateAttestation,
            DateDebut = entity.DateDebut,
            DateFin = entity.DateFin,
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
            if (request.PageNumber < 1)
            {
                request.PageNumber = 1;
            }

            if (request.PageSize is < 1 or > 100)
            {
                request.PageSize = 10;
            }

            IQueryable<Attestation> query = context.Attestations.Where(a => !a.Inactif);

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Numero);

            int totalCount = await query.CountAsync();

            List<Attestation> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<AttestationResponse>();
            foreach (Attestation item in items)
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
            logger.LogError("Error fetching Attestations: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<AttestationResponse> GetByIdAsync(int id)
    {
        Attestation? entity = await context.Attestations.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Attestation not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<AttestationResponse> CreateAsync(AttestationRequest request)
    {
        var entity = new Attestation
        {
            NoLocation = request.NoLocation,
            NoLocataire = request.NoLocataire,
            TypeAttestation = request.TypeAttestation,
            DateAttestation = request.DateAttestation,
            DateDebut = request.DateDebut,
            DateFin = request.DateFin,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Attestations.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Attestation with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<AttestationResponse> UpdateAsync(int id, AttestationRequest request)
    {
        Attestation? entity = await context.Attestations.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Attestation not found");
        }

        entity.NoLocation = request.NoLocation;
        entity.NoLocataire = request.NoLocataire;
        entity.TypeAttestation = request.TypeAttestation;
        entity.DateAttestation = request.DateAttestation;
        entity.DateDebut = request.DateDebut;
        entity.DateFin = request.DateFin;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Attestation with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Attestation? entity = await context.Attestations.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Attestation with ID {Id} deactivated successfully.", id);

        return result;
    }
}

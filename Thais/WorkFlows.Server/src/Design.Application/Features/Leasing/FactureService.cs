using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Leasing;

public class FactureService(DbDesignContext context, ILogger<FactureService> logger) : IFactureService
{
    private const string EtatAEchoir = "Impayée";
    private const string EtatPayee = "Payée";
    private const string EtatAnnulee = "Annulée";

    private async Task<string?> ResolveNomLocataireAsync(int noLocataire)
    {
        Locataire? locataire = await context.Locataires.FindAsync(noLocataire);
        if (locataire == null)
        {
            return null;
        }

        return locataire.TypeLocataire == 1
            ? locataire.DesignationEntreprise
            : $"{locataire.Nom} {locataire.Prenom}".Trim();
    }

    private async Task<FactureResponse> ToResponseAsync(Facture entity)
    {
        Bail? bail = await context.Baux.FindAsync(entity.NoLocation);

        Building? building = bail == null ? null : await context.Buildings.FindAsync(bail.NoBuilding);
        string? nomLocal = bail == null ? null : await context.Locaux
            .Where(x => x.Numero == bail.NoLocal).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocataire = bail == null ? null : await ResolveNomLocataireAsync(bail.NoLocataire);
        string? nomProprietaire = building?.NoProprietaire == null ? null : await context.Proprietaires
            .Where(x => x.Numero == building.NoProprietaire).Select(x => x.Designation).FirstOrDefaultAsync();

        return new FactureResponse
        {
            Numero = entity.Numero,
            NoLocation = entity.NoLocation,
            NumContratLocations = bail?.NumContratLocations,
            NomLocataire = nomLocataire,
            NomBuilding = building?.Designation,
            NomLocal = nomLocal,
            NomProprietaire = nomProprietaire,
            Periode = entity.Periode,
            DateEmission = entity.DateEmission,
            DateEcheance = entity.DateEcheance,
            LoyerNet = entity.LoyerNet,
            Charges = entity.Charges,
            TVA = entity.TVA,
            Taxe = entity.Taxe,
            Autres = entity.Autres,
            Montant = entity.Montant,
            TypeFacture = entity.TypeFacture,
            Etat = entity.Etat,
            Edite = entity.Edite,
            DemandeAnnulation = entity.DemandeAnnulation,
            DateAnnulation = entity.DateAnnulation,
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
            if (request.PageNumber < 1)
            {
                request.PageNumber = 1;
            }

            if (request.PageSize is < 1 or > 100)
            {
                request.PageSize = 10;
            }

            IQueryable<Facture> query = context.Factures;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Periode);

            List<Facture> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var bailIds = allMatching.Select(f => f.NoLocation).Distinct().ToList();
                Dictionary<int, Bail> baux = await context.Baux
                    .Where(b => bailIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero);

                var buildingIds = baux.Values.Select(b => b.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(f => baux.TryGetValue(f.NoLocation, out Bail? b) &&
                                buildingNames.TryGetValue(b.NoBuilding, out string? name) &&
                                name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;

            List<Facture> items = allMatching
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            var mapped = new List<FactureResponse>();
            foreach (Facture item in items)
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
            logger.LogError("Error fetching Factures: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<FactureResponse> GetByIdAsync(int id)
    {
        Facture? entity = await context.Factures.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Facture not found");
        }

        return await ToResponseAsync(entity);
    }

    // RMANew (JournalLoyer.MakeFacture / DataEntryQuittance.MakeFacture) : le montant est
    // un instantané des composantes du bail au moment de la génération, jamais recalculé
    // ensuite - une révision de loyer ultérieure ne doit pas changer une facture déjà émise.
    public async Task<FactureResponse> GenererAsync(FactureRequest request)
    {
        Bail? bail = await context.Baux.FindAsync(request.NoLocation);
        if (bail == null)
        {
            throw new KeyNotFoundException("Bail not found");
        }

        bool doublon = await context.Factures.AnyAsync(f =>
            f.NoLocation == request.NoLocation &&
            f.Periode == request.Periode &&
            f.Etat != EtatAnnulee);
        if (doublon)
        {
            throw new InvalidOperationException("Une facture existe déjà pour ce bail sur cette période.");
        }

        decimal loyerNet = request.LoyerNet ?? bail.LoyerNet ?? 0;
        decimal charges = request.Charges ?? bail.Charges ?? 0;
        decimal tva = request.TVA ?? bail.TVA ?? 0;
        decimal taxe = request.Taxe ?? bail.Taxe ?? 0;
        decimal autres = request.Autres ?? bail.Autres ?? 0;
        decimal montant = loyerNet + charges + tva + taxe + autres;

        var entity = new Facture
        {
            NoLocation = request.NoLocation,
            Periode = request.Periode,
            DateEmission = DateTime.UtcNow,
            DateEcheance = request.DateEcheance ?? request.Periode,
            LoyerNet = loyerNet,
            Charges = charges,
            TVA = tva,
            Taxe = taxe,
            Autres = autres,
            Montant = montant,
            TypeFacture = string.IsNullOrWhiteSpace(request.TypeFacture) ? "LoyerM" : request.TypeFacture,
            Etat = EtatAEchoir,
            Notes = request.Notes,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Factures.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Facture with ID {Numero} generated successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    // RMANew (ListFacture.vb) : marque la facture comme imprimée/éditée (Edité=1).
    public async Task<FactureResponse> MarquerEditeAsync(int id)
    {
        Facture? entity = await context.Factures.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Facture not found");
        }

        entity.Edite = true;
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return await ToResponseAsync(entity);
    }

    // RMANew (ListFacture.vb) : initie une demande d'annulation (DemandeAnnulation=1).
    // La confirmation définitive (Etat=Annulée) est faite par le bloc "Annulation Facture"
    // (à migrer ensuite), qui reproduira Classes/AnnulationsQuittances.vb.
    public async Task<FactureResponse> DemanderAnnulationAsync(int id)
    {
        Facture? entity = await context.Factures.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Facture not found");
        }

        if (entity.Etat == EtatPayee || entity.Etat == EtatAnnulee)
        {
            throw new InvalidOperationException("Impossible d'annuler une facture payée ou déjà annulée.");
        }

        entity.DemandeAnnulation = true;
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return await ToResponseAsync(entity);
    }

    // RMANew (Classes/AnnulationsQuittances.vb, InsertAnnulations) : confirmation
    // définitive d'une demande d'annulation - Etat=Annulée, DemandeAnnulation levée,
    // DateAnnulation horodatée. Le Montant n'est pas remis à zéro (le legacy ne le fait
    // pas non plus : seul le statut change, la facture garde la trace de ce qui était dû).
    public async Task<FactureResponse> ConfirmerAnnulationAsync(int id)
    {
        Facture? entity = await context.Factures.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Facture not found");
        }

        if (!entity.DemandeAnnulation)
        {
            throw new InvalidOperationException("Cette facture ne fait l'objet d'aucune demande d'annulation.");
        }

        entity.Etat = EtatAnnulee;
        entity.DemandeAnnulation = false;
        entity.DateAnnulation = DateTime.UtcNow;
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        logger.LogInformation("Facture with ID {Id} annulation confirmed.", id);

        return await ToResponseAsync(entity);
    }

    // Retrait d'une demande d'annulation avant confirmation (n'existe pas explicitement
    // dans RMANew, mais nécessaire ici puisque la demande et la confirmation sont deux
    // écrans séparés comme dans le legacy - sans ce retrait une demande erronée resterait
    // bloquée indéfiniment).
    public async Task<FactureResponse> AnnulerDemandeAnnulationAsync(int id)
    {
        Facture? entity = await context.Factures.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Facture not found");
        }

        entity.DemandeAnnulation = false;
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Facture? entity = await context.Factures.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        if (entity.Etat == EtatPayee || entity.Etat == EtatAnnulee)
        {
            throw new InvalidOperationException("Impossible de supprimer une facture payée ou déjà annulée.");
        }

        context.Factures.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Facture with ID {Id} deleted successfully.", id);

        return result;
    }
}

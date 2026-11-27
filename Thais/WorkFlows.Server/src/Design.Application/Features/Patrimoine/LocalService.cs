using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Patrimoine;

public class LocalService(DbDesignContext context, ILogger<LocalService> logger) : ILocalService
{
    private async Task<LocalResponse> ToResponseAsync(Local entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();

        string? nomLocalType = entity.NoLocalType is null
            ? null
            : await context.LocalTypes.Where(x => x.Numero == entity.NoLocalType).Select(x => x.Designation).FirstOrDefaultAsync();

        // RMANew (ListLocal) : le local est « Loué » quand il a un bail en cours ; on affiche alors son locataire et
        // le loyer net de ce bail (getLocalMontantBruteLocation). Sinon « Vacant », sans locataire, montant 0.
        var bail = await context.Baux
            .Where(b => b.NoLocal == entity.Numero && !b.Inactif && b.Etat == "En cours de location")
            .OrderByDescending(b => b.Numero)
            .Select(b => new { b.NoLocataire, b.LoyerNet, b.Montant })
            .FirstOrDefaultAsync();
        string? locataire = null;
        if (bail is not null)
        {
            var l = await context.Locataires
                .Where(x => x.Numero == bail.NoLocataire)
                .Select(x => new { x.TypeLocataire, x.DesignationEntreprise, x.Nom, x.Prenom })
                .FirstOrDefaultAsync();
            locataire = l is null ? null : l.TypeLocataire == 1 ? l.DesignationEntreprise : $"{l.Nom} {l.Prenom}".Trim();
        }

        return new LocalResponse
        {
            Numero = entity.Numero,
            Occupe = bail is not null,
            Locataire = locataire,
            // Colonne « Montant (CC/TC) » : le montant total du bail ; les baux importés n'ont que ce champ (LoyerNet vide).
            MontantLoyer = bail?.Montant ?? bail?.LoyerNet ?? 0,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            NoLocalType = entity.NoLocalType,
            NomLocalType = nomLocalType,
            Designation = entity.Designation,
            EnExploitation = entity.EnExploitation,
            Nondisponible = entity.Nondisponible,
            MoyensGeneraux = entity.MoyensGeneraux,
            MettreEnLocation = entity.MettreEnLocation,
            Responsable = entity.Responsable,
            NbrePiece = entity.NbrePiece,
            Surface = entity.Surface,
            Terrasse = entity.Terrasse,
            Address1 = entity.Address1,
            TitreFoncier = entity.TitreFoncier,
            AVendre = entity.AVendre,
            Etage = entity.Etage,
            DateModificationValeur = entity.DateModificationValeur,
            Notes = entity.Notes,
            DernierLoyer = entity.DernierLoyer,
            ValeurEntree = entity.ValeurEntree,
            ValeurInventaire = entity.ValeurInventaire,
            ValeurRealisation = entity.ValeurRealisation,
            Observation = entity.Observation,
            Image = entity.Image,
            PlanLocal = entity.PlanLocal,
            Etat = entity.Etat,
            Demande = entity.Demande,
            Suggestion = entity.Suggestion,
            MontantAmenagement = entity.MontantAmenagement,
            OffreLoyerHT = entity.OffreLoyerHT,
            OffreCharge = entity.OffreCharge,
            TVA = entity.TVA,
            OffreTSC = entity.OffreTSC,
            OffreLoyerTTC = entity.OffreLoyerTTC,
            Inactif = entity.Inactif,
            PrixCession = entity.PrixCession,
            Acquereur = entity.Acquereur,
            PromesseContratVente = entity.PromesseContratVente,
            DateSignaturePromesseVente = entity.DateSignaturePromesseVente,
            DateSignatureContratVente = entity.DateSignatureContratVente,
            DateEnregistrementContratVente = entity.DateEnregistrementContratVente,
            EncaissementRecuCession = entity.EncaissementRecuCession,
            DateReglementCession = entity.DateReglementCession,
            Vendu = entity.Vendu,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    // Même règle que RMANew (DataEntryLocaux.PreValidate) : Loyer TCTC = HT + TSC + Charges,
    // toujours recalculé côté serveur, jamais saisi directement.
    private static decimal? ComputeOffreLoyerTTC(LocalRequest request)
    {
        decimal ht = request.OffreLoyerHT ?? 0;
        decimal tsc = request.OffreTSC ?? 0;
        decimal charge = request.OffreCharge ?? 0;
        decimal total = ht + tsc + charge;
        return total == 0 ? null : total;
    }

    public Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request) =>
        GetPagedAsync(request, inactif: false);

    // Archives (RMANew ListArchivesLots.aspx) : même liste, mais Local.inactif=1.
    public Task<PagedResult<object>> GetArchivedAsync(GetFilterSearchSortRequest request) =>
        GetPagedAsync(request, inactif: true);

    private async Task<PagedResult<object>> GetPagedAsync(GetFilterSearchSortRequest request, bool inactif)
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

            IQueryable<Local> query = context.Locaux.Where(l => l.Inactif == inactif);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e => e.Designation.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderBy(e => e.Designation);

            int totalCount = await query.CountAsync();

            List<Local> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var mapped = new List<LocalResponse>();
            foreach (Local item in items)
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
            logger.LogError("Error fetching Locaux: {ExMessage}", ex.Message);
            throw;
        }
    }

    // RMANew (ViewPageEtatdesactifs.vb, "Liste Locaux vacants") : Local actif, Building
    // actif, sans bail en cours - RMANew filtre sur Local.Occupation=0 (absent du nouveau
    // schéma) ; remplacé par l'absence de Bail actif pour ce Local.
    public async Task<List<LocalVacantResponse>> GetVacantsAsync(int? noProprietaire)
    {
        HashSet<int> locauxOccupes = (await context.Baux
                .Where(b => !b.Inactif && b.Etat == "En cours de location")
                .Select(b => b.NoLocal)
                .ToListAsync())
            .ToHashSet();

        IQueryable<Building> buildingsQuery = context.Buildings.Where(b => !b.Inactif);
        if (noProprietaire is > 0)
        {
            buildingsQuery = buildingsQuery.Where(b => b.NoProprietaire == noProprietaire);
        }

        List<Building> buildings = await buildingsQuery.ToListAsync();
        Dictionary<int, Building> buildingsById = buildings.ToDictionary(b => b.Numero);

        var proprietaireIds = buildings.Where(b => b.NoProprietaire != null)
            .Select(b => b.NoProprietaire!.Value).Distinct().ToList();
        Dictionary<int, string> proprietaires = await context.Proprietaires
            .Where(p => proprietaireIds.Contains(p.Numero))
            .ToDictionaryAsync(p => p.Numero, p => p.Designation);

        List<Local> locaux = await context.Locaux
            .Where(l => !l.Inactif && buildingsById.Keys.Contains(l.NoBuilding) && !locauxOccupes.Contains(l.Numero))
            .OrderBy(l => l.NoBuilding).ThenBy(l => l.Designation)
            .ToListAsync();

        return locaux.Select(l =>
        {
            Building building = buildingsById[l.NoBuilding];
            string? nomProprietaire = building.NoProprietaire != null && proprietaires.TryGetValue(building.NoProprietaire.Value, out string? p)
                ? p
                : null;

            return new LocalVacantResponse
            {
                Numero = l.Numero,
                NomProprietaire = nomProprietaire,
                NomBuilding = building.Designation,
                NomLocal = l.Designation,
                Etage = l.Etage,
                Superficie = l.Surface,
                Adresse = l.Address1
            };
        }).ToList();
    }

    // Archives : réactiver un local désactivé (RMANew ListArchivesLots -> UPDATE Local SET inactif=0).
    public async Task<LocalResponse> ReactivateAsync(int id)
    {
        Local? entity = await context.Locaux.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Local not found");
        }

        entity.Inactif = false;
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        logger.LogInformation("Local with ID {Id} reactivated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<LocalResponse> GetByIdAsync(int id)
    {
        Local? entity = await context.Locaux.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Local not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<LocalResponse> CreateAsync(LocalRequest request)
    {
        var entity = new Local
        {
            NoBuilding = request.NoBuilding,
            NoLocalType = request.NoLocalType,
            Designation = request.Designation.Trim(),
            EnExploitation = request.EnExploitation,
            Nondisponible = request.Nondisponible,
            MoyensGeneraux = request.MoyensGeneraux,
            // Même quirk que RMANew (DataEntryLocaux.AfterSave) : un nouveau local est
            // toujours mis en location par défaut à la création.
            MettreEnLocation = true,
            Responsable = request.Responsable,
            NbrePiece = request.NbrePiece,
            Surface = request.Surface,
            Terrasse = request.Terrasse,
            Address1 = request.Address1,
            TitreFoncier = request.TitreFoncier,
            AVendre = request.AVendre,
            Etage = request.Etage,
            DateModificationValeur = request.DateModificationValeur,
            Notes = request.Notes,
            DernierLoyer = request.DernierLoyer,
            ValeurEntree = request.ValeurEntree,
            ValeurInventaire = request.ValeurInventaire,
            ValeurRealisation = request.ValeurRealisation,
            Observation = request.Observation,
            Image = request.Image,
            PlanLocal = request.PlanLocal,
            Etat = request.Etat,
            Demande = request.Demande,
            Suggestion = request.Suggestion,
            MontantAmenagement = request.MontantAmenagement,
            OffreLoyerHT = request.OffreLoyerHT,
            OffreCharge = request.OffreCharge,
            TVA = request.TVA,
            OffreTSC = request.OffreTSC,
            OffreLoyerTTC = ComputeOffreLoyerTTC(request),
            Inactif = request.Inactif,
            PrixCession = request.PrixCession,
            Acquereur = request.Acquereur,
            PromesseContratVente = request.PromesseContratVente,
            DateSignaturePromesseVente = request.DateSignaturePromesseVente,
            DateSignatureContratVente = request.DateSignatureContratVente,
            DateEnregistrementContratVente = request.DateEnregistrementContratVente,
            EncaissementRecuCession = request.EncaissementRecuCession,
            DateReglementCession = request.DateReglementCession,
            Vendu = request.Vendu,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Locaux.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Local with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<LocalResponse> UpdateAsync(int id, LocalRequest request)
    {
        Local? entity = await context.Locaux.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Local not found");
        }

        entity.NoBuilding = request.NoBuilding;
        entity.NoLocalType = request.NoLocalType;
        entity.Designation = request.Designation.Trim();
        entity.EnExploitation = request.EnExploitation;
        entity.Nondisponible = request.Nondisponible;
        entity.MoyensGeneraux = request.MoyensGeneraux;
        entity.MettreEnLocation = request.MettreEnLocation;
        entity.Responsable = request.Responsable;
        entity.NbrePiece = request.NbrePiece;
        entity.Surface = request.Surface;
        entity.Terrasse = request.Terrasse;
        entity.Address1 = request.Address1;
        entity.TitreFoncier = request.TitreFoncier;
        entity.AVendre = request.AVendre;
        entity.Etage = request.Etage;
        entity.DateModificationValeur = request.DateModificationValeur;
        entity.Notes = request.Notes;
        entity.DernierLoyer = request.DernierLoyer;
        entity.ValeurEntree = request.ValeurEntree;
        entity.ValeurInventaire = request.ValeurInventaire;
        entity.ValeurRealisation = request.ValeurRealisation;
        entity.Observation = request.Observation;
        entity.Image = request.Image;
        entity.PlanLocal = request.PlanLocal;
        entity.Etat = request.Etat;
        entity.Demande = request.Demande;
        entity.Suggestion = request.Suggestion;
        entity.MontantAmenagement = request.MontantAmenagement;
        entity.OffreLoyerHT = request.OffreLoyerHT;
        entity.OffreCharge = request.OffreCharge;
        entity.TVA = request.TVA;
        entity.OffreTSC = request.OffreTSC;
        entity.OffreLoyerTTC = ComputeOffreLoyerTTC(request);
        entity.Inactif = request.Inactif;
        entity.PrixCession = request.PrixCession;
        entity.Acquereur = request.Acquereur;
        entity.PromesseContratVente = request.PromesseContratVente;
        entity.DateSignaturePromesseVente = request.DateSignaturePromesseVente;
        entity.DateSignatureContratVente = request.DateSignatureContratVente;
        entity.DateEnregistrementContratVente = request.DateEnregistrementContratVente;
        entity.EncaissementRecuCession = request.EncaissementRecuCession;
        entity.DateReglementCession = request.DateReglementCession;
        entity.Vendu = request.Vendu;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Local with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Local? entity = await context.Locaux.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        // Suppression logique (comme RMANew : Deactiver -> inactif=1), pas de suppression physique.
        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Local with ID {Id} deactivated successfully.", id);

        return result;
    }
}

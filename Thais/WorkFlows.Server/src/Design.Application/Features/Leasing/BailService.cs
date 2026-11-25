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

public class BailService(DbDesignContext context, ILogger<BailService> logger) : IBailService
{
    private async Task<BailResponse> ToResponseAsync(Bail entity) =>
        (await ToResponsesAsync([entity]))[0];

    // Construit les réponses de plusieurs baux avec UNE requête par type de libellé (actif, local, encaisseur,
    // périodicité, locataire) au lieu de ~7 requêtes par bail : une liste de 78 baux (export) passe de plus de
    // 10 secondes à moins d'une seconde sur une base distante.
    private async Task<List<BailResponse>> ToResponsesAsync(IReadOnlyCollection<Bail> baux)
    {
        var buildingIds = baux.Select(b => b.NoBuilding).Distinct().ToList();
        var localIds = baux.Select(b => b.NoLocal).Distinct().ToList();
        var encaisseurIds = baux.Where(b => b.NoEncaisseur != null).Select(b => b.NoEncaisseur!.Value).Distinct().ToList();
        var periodiciteIds = baux.Where(b => b.NoPeriodicity != null).Select(b => b.NoPeriodicity!.Value).Distinct().ToList();
        var locataireIds = baux.Select(b => b.NoLocataire).Distinct().ToList();

        Dictionary<int, string?> buildings = await context.Buildings
            .Where(x => buildingIds.Contains(x.Numero))
            .ToDictionaryAsync(x => x.Numero, x => (string?)x.Designation);
        var locaux = (await context.Locaux
                .Where(x => localIds.Contains(x.Numero))
                .Select(x => new { x.Numero, x.Designation, x.Etage, x.Surface })
                .ToListAsync())
            .ToDictionary(x => x.Numero);
        Dictionary<int, string?> encaisseurs = await context.Encaisseurs
            .Where(x => encaisseurIds.Contains(x.Numero))
            .ToDictionaryAsync(x => x.Numero, x => (string?)x.Designation);
        Dictionary<int, string?> periodicites = await context.Periodicites
            .Where(x => periodiciteIds.Contains(x.Numero))
            .ToDictionaryAsync(x => x.Numero, x => (string?)x.Designation);
        var locataires = (await context.Locataires
                .Where(x => locataireIds.Contains(x.Numero))
                .Select(x => new { x.Numero, x.TypeLocataire, x.DesignationEntreprise, x.Nom, x.Prenom })
                .ToListAsync())
            .ToDictionary(x => x.Numero);

        var result = new List<BailResponse>(baux.Count);
        foreach (Bail entity in baux)
        {
            locaux.TryGetValue(entity.NoLocal, out var local);

            string? nomLocataire = null;
            if (locataires.TryGetValue(entity.NoLocataire, out var locataire))
            {
                nomLocataire = locataire.TypeLocataire == 1
                    ? locataire.DesignationEntreprise
                    : $"{locataire.Nom} {locataire.Prenom}".Trim();
            }

            result.Add(BuildResponse(
                entity,
                buildings.GetValueOrDefault(entity.NoBuilding),
                local?.Designation,
                local?.Etage,
                local?.Surface,
                entity.NoEncaisseur is { } ne ? encaisseurs.GetValueOrDefault(ne) : null,
                entity.NoPeriodicity is { } np ? periodicites.GetValueOrDefault(np) : null,
                nomLocataire));
        }

        return result;
    }

    private static BailResponse BuildResponse(
        Bail entity,
        string? nomBuilding,
        string? nomLocal,
        string? etage,
        decimal? surface,
        string? nomEncaisseur,
        string? nomPeriodicity,
        string? nomLocataire)
    {
        return new BailResponse
        {
            Numero = entity.Numero,
            NumContratLocations = entity.NumContratLocations,
            NoBuilding = entity.NoBuilding,
            NomBuilding = nomBuilding,
            NoLocal = entity.NoLocal,
            NomLocal = nomLocal,
            Etage = etage,
            Surface = surface,
            NoLocataire = entity.NoLocataire,
            NomLocataire = nomLocataire,
            NoEncaisseur = entity.NoEncaisseur,
            NomEncaisseur = nomEncaisseur,
            NoPeriodicity = entity.NoPeriodicity,
            NomPeriodicity = nomPeriodicity,
            Usage = entity.Usage,
            DateDebut = entity.DateDebut,
            DateGestion = entity.DateGestion,
            DateFin = entity.DateFin,
            Franchise = entity.Franchise,
            LoyerNet = entity.LoyerNet,
            Charges = entity.Charges,
            TVA = entity.TVA,
            Taxe = entity.Taxe,
            LoyerGarage = entity.LoyerGarage,
            Autres = entity.Autres,
            Montant = entity.Montant,
            GenererQuittance = entity.GenererQuittance,
            Garantie = entity.Garantie,
            Caution = entity.Caution,
            ModeReglement = entity.ModeReglement,
            Etat = entity.Etat,
            Notes = entity.Notes,
            Inactif = entity.Inactif,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    // Même logique que RMANew (LXMontant) : le loyer total est la somme de ses
    // composantes, jamais saisi directement.
    private static decimal? ComputeMontant(BailRequest request)
    {
        decimal total = (request.LoyerNet ?? 0) + (request.Charges ?? 0) + (request.TVA ?? 0) +
                         (request.Taxe ?? 0) + (request.LoyerGarage ?? 0) + (request.Autres ?? 0);
        return total == 0 ? null : total;
    }

    // RMANew ne propose pas de sélecteur d'actif sur DataEntryLocataire.aspx : la colonne
    // "Actif" de ListLocataire.aspx (Locataire.NoBuilding) est en réalité synchronisée
    // depuis le bail (Location.NoBuilding/NoLocal) au moment de sa sauvegarde - vérifié sur
    // les données de prod AKKAR (NoBuilding du Locataire == NoBuilding de son bail dans tous
    // les échantillons contrôlés). On reproduit cette synchronisation ici.
    private async Task SyncLocataireActifAsync(int noLocataire, int noBuilding, int noLocal)
    {
        Locataire? locataire = await context.Locataires.FindAsync(noLocataire);
        if (locataire == null)
        {
            return;
        }

        locataire.NoBuilding = noBuilding;
        locataire.NoLocal = noLocal;
        locataire.ModDate = DateTime.UtcNow;
    }

    public Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request) =>
        GetPagedAsync(request, context.Baux.Where(b => !b.Inactif));

    // Archives (RMANew ListArchivesLocation.aspx) : cFilter = "(Location.inactif=1 or
    // Location.EtatLocation!=1) and Location.Montant>0" - un bail résilié/inactif OU dont
    // l'état n'est plus "En cours de location", avec un montant non nul.
    public Task<PagedResult<object>> GetArchivedAsync(GetFilterSearchSortRequest request) =>
        GetPagedAsync(request, context.Baux.Where(b =>
            (b.Inactif || b.Etat != "En cours de location") && b.Montant > 0));

    private async Task<PagedResult<object>> GetPagedAsync(GetFilterSearchSortRequest request, IQueryable<Bail> query)
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

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateDebut);

            List<Bail> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var buildingIds = allMatching.Select(b => b.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(b => buildingNames.TryGetValue(b.NoBuilding, out string? name) && name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;

            List<Bail> items = allMatching
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            List<BailResponse> mapped = await ToResponsesAsync(items);

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
            logger.LogError("Error fetching Baux: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<BailResponse> GetByIdAsync(int id)
    {
        Bail? entity = await context.Baux.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Bail not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<BailResponse> CreateAsync(BailRequest request)
    {
        var entity = new Bail
        {
            NumContratLocations = request.NumContratLocations,
            NoBuilding = request.NoBuilding,
            NoLocal = request.NoLocal,
            NoLocataire = request.NoLocataire,
            NoEncaisseur = request.NoEncaisseur,
            NoPeriodicity = request.NoPeriodicity,
            Usage = request.Usage,
            DateDebut = request.DateDebut,
            DateGestion = request.DateGestion,
            DateFin = request.DateFin,
            Franchise = request.Franchise,
            LoyerNet = request.LoyerNet,
            Charges = request.Charges,
            TVA = request.TVA,
            Taxe = request.Taxe,
            LoyerGarage = request.LoyerGarage,
            Autres = request.Autres,
            Montant = ComputeMontant(request),
            GenererQuittance = request.GenererQuittance,
            Garantie = request.Garantie,
            Caution = request.Caution,
            ModeReglement = request.ModeReglement,
            Etat = request.Etat,
            Notes = request.Notes,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Baux.Add(entity);
        await SyncLocataireActifAsync(entity.NoLocataire, entity.NoBuilding, entity.NoLocal);
        await context.SaveChangesAsync();

        logger.LogInformation("Bail with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<BailResponse> UpdateAsync(int id, BailRequest request)
    {
        Bail? entity = await context.Baux.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Bail not found");
        }

        entity.NumContratLocations = request.NumContratLocations;
        entity.NoBuilding = request.NoBuilding;
        entity.NoLocal = request.NoLocal;
        entity.NoLocataire = request.NoLocataire;
        entity.NoEncaisseur = request.NoEncaisseur;
        entity.NoPeriodicity = request.NoPeriodicity;
        entity.Usage = request.Usage;
        entity.DateDebut = request.DateDebut;
        entity.DateGestion = request.DateGestion;
        entity.DateFin = request.DateFin;
        entity.Franchise = request.Franchise;
        entity.LoyerNet = request.LoyerNet;
        entity.Charges = request.Charges;
        entity.TVA = request.TVA;
        entity.Taxe = request.Taxe;
        entity.LoyerGarage = request.LoyerGarage;
        entity.Autres = request.Autres;
        entity.Montant = ComputeMontant(request);
        entity.GenererQuittance = request.GenererQuittance;
        entity.Garantie = request.Garantie;
        entity.Caution = request.Caution;
        entity.ModeReglement = request.ModeReglement;
        entity.Etat = request.Etat;
        entity.Notes = request.Notes;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await SyncLocataireActifAsync(entity.NoLocataire, entity.NoBuilding, entity.NoLocal);
        await context.SaveChangesAsync();

        logger.LogInformation("Bail with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Bail? entity = await context.Baux.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Bail with ID {Id} deactivated successfully.", id);

        return result;
    }

    // Archives : réactiver un bail (RMANew ListArchivesLocation -> UPDATE Location SET
    // EtatLocation=1, inactif=0 - double reset, reproduit ici sur Inactif ET Etat).
    public async Task<BailResponse> ReactivateAsync(int id)
    {
        Bail? entity = await context.Baux.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Bail not found");
        }

        entity.Inactif = false;
        entity.Etat = "En cours de location";
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        logger.LogInformation("Bail with ID {Id} reactivated successfully.", id);

        return await ToResponseAsync(entity);
    }

    // RMANew (ListNouveauxBaux.vb) : baux actifs signés dans l'année en cours. "Usage"
    // reprend la typologie de l'actif (BuildingType), pas Bail.Usage - RMANew le lit lui
    // aussi depuis BuildingType.descript_F, pas depuis Location.Usage. "Loyer de base"
    // (LoyerNet + Amenagement côté RMANew) n'a pas d'équivalent Amenagement sur Bail ici -
    // remplacé par LoyerNet + Autres, le champ générique le plus proche.
    public async Task<List<NouveauBailResponse>> GetNouveauxAsync(int? noProprietaire)
    {
        int anneeCourante = DateTime.UtcNow.Year;

        IQueryable<Bail> query = context.Baux
            .Where(b => !b.Inactif && b.Montant > 0 && b.AddDate.Year == anneeCourante);

        List<Bail> baux = await query.ToListAsync();

        var buildingIds = baux.Select(b => b.NoBuilding).Distinct().ToList();
        Dictionary<int, Building> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        if (noProprietaire is > 0)
        {
            baux = baux.Where(b => buildings.TryGetValue(b.NoBuilding, out Building? bd) && bd.NoProprietaire == noProprietaire).ToList();
        }

        var buildingTypeIds = buildings.Values.Where(b => b.NoBuildingType != null)
            .Select(b => b.NoBuildingType!.Value).Distinct().ToList();
        Dictionary<int, string> buildingTypes = await context.BuildingTypes
            .Where(t => buildingTypeIds.Contains(t.Numero))
            .ToDictionaryAsync(t => t.Numero, t => t.Designation);

        var localIds = baux.Select(b => b.NoLocal).Distinct().ToList();
        Dictionary<int, Local> locaux = await context.Locaux
            .Where(l => localIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        var locataireIds = baux.Select(b => b.NoLocataire).Distinct().ToList();
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(l => locataireIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        var bailIds = baux.Select(b => b.Numero).ToList();
        Dictionary<int, decimal> cumulParBail = (await context.Factures
                .Where(f => bailIds.Contains(f.NoLocation) && f.Etat != "Annulée")
                .ToListAsync())
            .GroupBy(f => f.NoLocation)
            .ToDictionary(g => g.Key, g => g.Sum(f => f.Montant));

        Dictionary<int, RevisionLoyer> derniereRevisionParBail = (await context.RevisionsLoyer
                .Where(r => bailIds.Contains(r.NoLocation))
                .ToListAsync())
            .GroupBy(r => r.NoLocation)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(r => r.Numero).First());

        return baux.Select(b =>
        {
            buildings.TryGetValue(b.NoBuilding, out Building? building);
            locaux.TryGetValue(b.NoLocal, out Local? local);
            locataires.TryGetValue(b.NoLocataire, out Locataire? locataire);
            derniereRevisionParBail.TryGetValue(b.Numero, out RevisionLoyer? revision);

            string? nomLocataire = locataire == null
                ? null
                : locataire.TypeLocataire == 1
                    ? locataire.DesignationEntreprise
                    : $"{locataire.Nom} {locataire.Prenom}".Trim();

            string? usage = building?.NoBuildingType != null && buildingTypes.TryGetValue(building.NoBuildingType.Value, out string? u)
                ? u
                : null;

            return new NouveauBailResponse
            {
                Numero = b.Numero,
                NomBuilding = building?.Designation,
                DateDebut = b.DateDebut,
                NomLocataire = nomLocataire,
                Usage = usage,
                Etage = local?.Etage,
                LoyerMensuel = b.Montant,
                CumulMontant = cumulParBail.GetValueOrDefault(b.Numero),
                NumContratLocations = b.NumContratLocations,
                NomLocal = local?.Designation,
                Superficie = local?.Surface,
                LoyerDeBase = (b.LoyerNet ?? 0) + (b.Autres ?? 0),
                DateFin = b.DateFin,
                DateRevision = revision?.DateRevision,
                DateProchaineRevision = revision?.DateProchaineRevision
            };
        })
        .OrderBy(r => r.NomBuilding)
        .ToList();
    }

    // Import Excel des baux (THAIS). Une ligne = un locataire dans un actif : l'actif est créé s'il
    // n'existe pas (recherche par désignation ou code), le locataire est réutilisé s'il existe déjà
    // (même raison sociale), un local « Local - <locataire> » est créé (le fichier de CFC ne donne pas
    // de liste de locaux) puis le bail. Un bail déjà présent (même actif, même locataire, même date
    // de début) est ignoré, ce qui rend l'import rejouable sans doublons. Tout est dans une
    // transaction : si une erreur imprévue survient, rien n'est enregistré.
    public async Task<BailImportResponse> ImportAsync(BailImportRequest request)
    {
        if (request.Lignes.Count == 0)
        {
            throw new ArgumentException("Aucune ligne à importer.");
        }

        if (request.Lignes.Count > 2000)
        {
            throw new ArgumentException("Trop de lignes (maximum 2000 par import).");
        }

        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;
        DateTime aujourdhui = now.Date;
        List<BailImportIssueResponse> ignorees = [];
        int actifsCrees = 0, locatairesCrees = 0, locauxCrees = 0, bauxCrees = 0;

        await using var transaction = await context.Database.BeginTransactionAsync();

        // Index des actifs et locataires existants (clé = texte en minuscules, sans espaces superflus).
        static string Cle(string? s) => (s ?? string.Empty).Trim().ToLowerInvariant();
        Dictionary<string, Building> actifs = [];
        foreach (Building b in await context.Buildings.ToListAsync())
        {
            actifs.TryAdd(Cle(b.Designation), b);
            actifs.TryAdd(Cle(b.CodeImmeuble), b);
        }

        Dictionary<string, Locataire> locataires = [];
        foreach (Locataire l in await context.Locataires.Where(l => l.TypeLocataire == 1).ToListAsync())
        {
            locataires.TryAdd(Cle(l.DesignationEntreprise), l);
        }

        for (int i = 0; i < request.Lignes.Count; i++)
        {
            BailImportRowRequest ligne = request.Lignes[i];
            int numero = i + 1;
            string nomLocataire = (ligne.Locataire ?? string.Empty).Trim();
            string nomActif = (ligne.Actif ?? string.Empty).Trim();

            string? probleme =
                nomLocataire.Length == 0 ? "Locataire manquant."
                : nomActif.Length == 0 ? "Actif (colonne Building) manquant."
                : ligne.DateDebut is null ? "Date de prise d'effet du bail manquante."
                : ligne.DateFin is not null && ligne.DateFin < ligne.DateDebut ? "La date de fin est antérieure à la date de début."
                : ligne.Surface < 0 ? "Superficie négative."
                : null;
            if (probleme is not null)
            {
                ignorees.Add(new BailImportIssueResponse { Ligne = numero, Locataire = nomLocataire, Message = probleme });
                continue;
            }

            // Actif
            if (!actifs.TryGetValue(Cle(nomActif), out Building? actif))
            {
                actif = new Building
                {
                    CodeImmeuble = nomActif,
                    Designation = nomActif,
                    EnExploitation = true,
                    NAffectation = "N.A",
                    AddUser = user,
                    AddDate = now,
                    ModUser = user,
                    ModDate = now
                };
                context.Buildings.Add(actif);
                await context.SaveChangesAsync();
                actifs[Cle(nomActif)] = actif;
                actifsCrees++;
            }

            // Locataire (personne morale, comme le fichier CFC)
            if (!locataires.TryGetValue(Cle(nomLocataire), out Locataire? locataire))
            {
                locataire = new Locataire
                {
                    TypeLocataire = 1,
                    DesignationEntreprise = nomLocataire,
                    AddUser = user,
                    AddDate = now,
                    ModUser = user,
                    ModDate = now
                };
                context.Locataires.Add(locataire);
                await context.SaveChangesAsync();
                locataires[Cle(nomLocataire)] = locataire;
                locatairesCrees++;
            }

            // Doublon : même actif, même locataire, même date de début
            bool existe = await context.Baux.AnyAsync(b =>
                b.NoBuilding == actif.Numero && b.NoLocataire == locataire.Numero && b.DateDebut == ligne.DateDebut);
            if (existe)
            {
                ignorees.Add(new BailImportIssueResponse { Ligne = numero, Locataire = nomLocataire, Message = "Bail déjà existant (même actif, locataire et date de début) : ignoré." });
                continue;
            }

            // Local : un par bail, « Local - <locataire> » (suffixe si le nom existe déjà dans l'actif)
            string nomLocal = $"Local - {nomLocataire}";
            int deja = await context.Locaux.CountAsync(l => l.NoBuilding == actif.Numero && l.Designation.StartsWith(nomLocal));
            if (deja > 0)
            {
                nomLocal = $"{nomLocal} ({deja + 1})";
            }

            var local = new Local
            {
                NoBuilding = actif.Numero,
                Designation = nomLocal,
                EnExploitation = true,
                Surface = ligne.Surface,
                // Nombre de places de parking = « Nb Pièces / Places » du local (colonne « Nbr place parking » du fichier).
                NbrePiece = ligne.Parking,
                Notes = $"Parking : {ligne.Parking} place(s)",
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            };
            context.Locaux.Add(local);
            await context.SaveChangesAsync();
            locauxCrees++;

            // Même synchronisation que SyncLocataireActifAsync : le locataire pointe sur son actif et son local.
            locataire.NoBuilding = actif.Numero;
            locataire.NoLocal = local.Numero;

            string notes = string.Join(" | ", new[]
            {
                string.IsNullOrWhiteSpace(ligne.DureeContrat) ? null : $"Durée : {ligne.DureeContrat.Trim()}",
                string.IsNullOrWhiteSpace(ligne.Preavis) ? null : $"Préavis : {ligne.Preavis.Trim()}"
            }.Where(s => s is not null));

            context.Baux.Add(new Bail
            {
                NoBuilding = actif.Numero,
                NoLocal = local.Numero,
                NoLocataire = locataire.Numero,
                DateDebut = ligne.DateDebut,
                DateGestion = ligne.DateGestion,
                DateFin = ligne.DateFin,
                Etat = ligne.DateFin is not null && ligne.DateFin.Value.Date < aujourdhui ? "Location Terminée" : "En cours de location",
                Notes = notes.Length == 0 ? null : notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            await context.SaveChangesAsync();
            bauxCrees++;
        }

        await transaction.CommitAsync();
        logger.LogInformation("Import des baux : {Baux} baux, {Locaux} locaux, {Locataires} locataires, {Actifs} actifs créés ; {Ignorees} lignes ignorées.",
            bauxCrees, locauxCrees, locatairesCrees, actifsCrees, ignorees.Count);

        return new BailImportResponse
        {
            ActifsCrees = actifsCrees,
            LocatairesCrees = locatairesCrees,
            LocauxCrees = locauxCrees,
            BauxCrees = bauxCrees,
            Ignorees = ignorees
        };
    }
}

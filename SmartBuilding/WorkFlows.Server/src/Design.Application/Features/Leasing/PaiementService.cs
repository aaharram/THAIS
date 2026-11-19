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

public class PaiementService(DbDesignContext context, ILogger<PaiementService> logger) : IPaiementService
{
    private static readonly string[] EtatsImpayes = ["Impayée", "Partiellement payée"];

    // RMANew (ListPaiementClient.aspx) : une ligne par bail ayant un loyer impayé,
    // filtrable par Filiale (Proprietaire du Building) et Encaisseur, comme les listes
    // "ListFiliale"/"ListEncaisseur" du legacy.
    public async Task<PagedResult<object>> GetSummaryAsync(GetFilterSearchSortRequest request, int noProprietaire, int noEncaisseur)
    {
        if (request.PageNumber < 1)
        {
            request.PageNumber = 1;
        }

        if (request.PageSize is < 1 or > 100)
        {
            request.PageSize = 10;
        }

        List<Facture> facturesImpayees = await context.Factures
            .Where(f => EtatsImpayes.Contains(f.Etat) && f.Montant > 0)
            .ToListAsync();

        var soldesParBail = facturesImpayees
            .GroupBy(f => f.NoLocation)
            .ToDictionary(g => g.Key, g => new { Solde = g.Sum(f => f.Montant), Nombre = g.Count() });

        if (soldesParBail.Count == 0)
        {
            return new PagedResult<object> { Items = [], TotalCount = 0, PageNumber = request.PageNumber, PageSize = request.PageSize };
        }

        var bailIds = soldesParBail.Keys.ToList();
        Dictionary<int, Bail> baux = await context.Baux
            .Where(b => bailIds.Contains(b.Numero) && (noEncaisseur <= 0 || b.NoEncaisseur == noEncaisseur))
            .ToDictionaryAsync(b => b.Numero);

        var buildingIds = baux.Values.Select(b => b.NoBuilding).Distinct().ToList();
        var locataireIds = baux.Values.Select(b => b.NoLocataire).Distinct().ToList();
        var encaisseurIds = baux.Values.Where(b => b.NoEncaisseur != null).Select(b => b.NoEncaisseur!.Value).Distinct().ToList();

        Dictionary<int, Building> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero) && (noProprietaire <= 0 || b.NoProprietaire == noProprietaire))
            .ToDictionaryAsync(b => b.Numero);
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(l => locataireIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);
        Dictionary<int, string> encaisseurs = await context.Encaisseurs
            .Where(e => encaisseurIds.Contains(e.Numero))
            .ToDictionaryAsync(e => e.Numero, e => e.Designation);

        var summaries = soldesParBail
            .Where(kv => baux.ContainsKey(kv.Key) && buildings.ContainsKey(baux[kv.Key].NoBuilding))
            .Select(kv =>
            {
                Bail bail = baux[kv.Key];
                Building building = buildings[bail.NoBuilding];
                locataires.TryGetValue(bail.NoLocataire, out Locataire? locataire);
                string nomLocataire = locataire == null
                    ? ""
                    : locataire.TypeLocataire == 1
                        ? locataire.DesignationEntreprise ?? ""
                        : $"{locataire.Nom} {locataire.Prenom}".Trim();

                string? nomEncaisseur = bail.NoEncaisseur != null && encaisseurs.TryGetValue(bail.NoEncaisseur.Value, out string? enc) ? enc : null;

                return new PaiementSummaryResponse
                {
                    NoLocation = kv.Key,
                    NumContratLocations = bail.NumContratLocations,
                    NomLocataire = nomLocataire,
                    NomBuilding = building.Designation,
                    NoProprietaire = building.NoProprietaire,
                    NoEncaisseur = bail.NoEncaisseur,
                    NomEncaisseur = nomEncaisseur,
                    LoyerMensuel = bail.Montant ?? 0,
                    NombreFacturesImpayees = kv.Value.Nombre,
                    MontantImpaye = kv.Value.Solde
                };
            })
            .ToList();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            string search = request.Search.Trim().ToLower();
            summaries = summaries
                .Where(s => s.NomLocataire.ToLower().Contains(search) || s.NomBuilding.ToLower().Contains(search))
                .ToList();
        }

        summaries = summaries.OrderBy(s => s.NomLocataire).ToList();

        int totalCount = summaries.Count;
        List<PaiementSummaryResponse> page = summaries
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        return new PagedResult<object>
        {
            Items = page.Cast<object>().ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }

    // EF Core ne peut pas retraduire un Sum/OrderBy appliqué APRES une projection dans un
    // type composite (record, tuple...) issue d'un JOIN à plusieurs niveaux - on garde donc
    // la requête sur Paiement seul, et on exprime les critères liés au Bail/Building/
    // Locataire comme des sous-requêtes EXISTS (Any), pleinement traduisibles en SQL. Les
    // données d'affichage (nom du building, du locataire...) sont résolues séparément après
    // pagination, comme dans GetSummaryAsync.
    private IQueryable<Paiement> BuildEncaissementQuery(
        string? search, int noProprietaire, int noEncaisseur, int annee, int mois, string? statutAnnulation = null)
    {
        IQueryable<Paiement> paiements = context.Paiements;

        if (annee > 0)
        {
            paiements = paiements.Where(p => p.DatePaiement.Year == annee);
        }

        if (mois > 0)
        {
            paiements = paiements.Where(p => p.DatePaiement.Month == mois);
        }

        if (noEncaisseur > 0)
        {
            paiements = paiements.Where(p => p.NoEncaisseur == noEncaisseur);
        }

        // RMANew (AnnulationsEncaissements.aspx / ListEncaissementsAnnules.aspx) : deux
        // vues du même statut d'annulation - "en-attente" (DemandeAnnulation en cours de
        // confirmation) et "annule" (résolue, qu'elle ait été confirmée via "Annuler" OU
        // "Rejeter" - les deux terminent dans BordereauAnnulations côté legacy). La liste
        // "Encaissement" principale reste non filtrée, comme ListEncaissement.aspx.
        if (statutAnnulation == "en-attente")
        {
            paiements = paiements.Where(p => p.DemandeAnnulation && !p.Annule && !p.Rejete);
        }
        else if (statutAnnulation == "annule")
        {
            paiements = paiements.Where(p => p.Annule || p.Rejete);
        }

        // Équivalent de l'INNER JOIN Bail/Building d'origine : un paiement dont le bail ou
        // l'actif n'existe plus (ou n'appartient pas au propriétaire filtré) est exclu.
        paiements = paiements.Where(p => context.Baux.Any(b => b.Numero == p.NoLocation &&
            context.Buildings.Any(bld => bld.Numero == b.NoBuilding && (noProprietaire <= 0 || bld.NoProprietaire == noProprietaire))));

        if (!string.IsNullOrWhiteSpace(search))
        {
            string s = search.Trim();
            paiements = paiements.Where(p => context.Baux.Any(b => b.Numero == p.NoLocation && (
                context.Buildings.Any(bld => bld.Numero == b.NoBuilding && EF.Functions.Like(bld.Designation, $"%{s}%")) ||
                context.Locataires.Any(loc => loc.Numero == b.NoLocataire && (
                    EF.Functions.Like(loc.DesignationEntreprise ?? "", $"%{s}%") ||
                    EF.Functions.Like(loc.Nom ?? "", $"%{s}%") ||
                    EF.Functions.Like(loc.Prenom ?? "", $"%{s}%"))))));
        }

        return paiements;
    }

    // RMANew (ListEncaissement.aspx) : consultation des encaissements déjà enregistrés
    // (créés via Paiement Client), filtrable par Année/Mois/Filiale/Encaisseur comme le
    // legacy - pas de recréation du formulaire d'édition Bordereau (Banque/Ville/Remise),
    // ni de l'annulation (tuile "Annulation Encaissement" séparée, non couverte ici).
    public async Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request, int noProprietaire, int noEncaisseur, int annee, int mois, string? statutAnnulation)
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

        IQueryable<Paiement> query = BuildEncaissementQuery(request.Search, noProprietaire, noEncaisseur, annee, mois, statutAnnulation);

        int totalCount = await query.CountAsync();

        List<Paiement> page = await query
            .OrderByDescending(p => p.DatePaiement)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync();

        var bailIds = page.Select(p => p.NoLocation).Distinct().ToList();
        Dictionary<int, Bail> baux = await context.Baux
            .Where(b => bailIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        var buildingIds = baux.Values.Select(b => b.NoBuilding).Distinct().ToList();
        Dictionary<int, Building> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        var locataireIds = baux.Values.Select(b => b.NoLocataire).Distinct().ToList();
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(l => locataireIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        var encaisseurIds = page.Where(p => p.NoEncaisseur != null).Select(p => p.NoEncaisseur!.Value).Distinct().ToList();
        Dictionary<int, string> encaisseurs = await context.Encaisseurs
            .Where(e => encaisseurIds.Contains(e.Numero))
            .ToDictionaryAsync(e => e.Numero, e => e.Designation);

        var paiementIds = page.Select(p => p.Numero).ToList();
        Dictionary<int, (DateTime Debut, DateTime Fin)> periodes = await (
                from pf in context.PaiementFactures
                join f in context.Factures on pf.NoFacture equals f.Numero
                where paiementIds.Contains(pf.NoPaiement)
                group f by pf.NoPaiement into g
                select new { NoPaiement = g.Key, Debut = g.Min(f => f.Periode), Fin = g.Max(f => f.Periode) })
            .ToDictionaryAsync(g => g.NoPaiement, g => (g.Debut, g.Fin));

        List<PaiementResponse> items = page.Select(p =>
        {
            baux.TryGetValue(p.NoLocation, out Bail? bail);
            Building? building = bail != null && buildings.TryGetValue(bail.NoBuilding, out Building? bld) ? bld : null;
            Locataire? locataire = bail != null && locataires.TryGetValue(bail.NoLocataire, out Locataire? loc) ? loc : null;
            string? nomLocataire = locataire == null
                ? null
                : locataire.TypeLocataire == 1 ? locataire.DesignationEntreprise : $"{locataire.Nom} {locataire.Prenom}".Trim();
            string? nomEncaisseur = p.NoEncaisseur != null && encaisseurs.TryGetValue(p.NoEncaisseur.Value, out string? enc) ? enc : null;
            periodes.TryGetValue(p.Numero, out (DateTime Debut, DateTime Fin) periode);

            return new PaiementResponse
            {
                Numero = p.Numero,
                NoLocation = p.NoLocation,
                NumContratLocations = bail?.NumContratLocations,
                NomLocataire = nomLocataire,
                NomBuilding = building?.Designation,
                NomEncaisseur = nomEncaisseur,
                Montant = p.Montant,
                ModePaiement = p.ModePaiement,
                DatePaiement = p.DatePaiement,
                Reference = p.Reference,
                Notes = p.Notes,
                DemandeAnnulation = p.DemandeAnnulation,
                Annule = p.Annule,
                Rejete = p.Rejete,
                DateAnnulation = p.DateAnnulation,
                PeriodeDebut = periode.Debut == default ? null : periode.Debut,
                PeriodeFin = periode.Fin == default ? null : periode.Fin,
                NumRemiseBancaire = p.NumRemiseBancaire,
                Genere = p.Genere,
                AddUser = p.AddUser,
                AddDate = p.AddDate
            };
        }).ToList();

        return new PagedResult<object>
        {
            Items = items.Cast<object>().ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching Encaissements: {ExMessage}", ex.Message);
            throw;
        }
    }

    // RMANew (ListEncaissement.aspx, LXTotalFoot) : total "Total <année>" en pied de liste
    // - calculé sur l'ensemble des lignes filtrées, pas seulement la page affichée.
    public async Task<decimal> GetTotalMontantAsync(string? search, int noProprietaire, int noEncaisseur, int annee, int mois, string? statutAnnulation)
    {
        try
        {
            IQueryable<Paiement> query = BuildEncaissementQuery(search, noProprietaire, noEncaisseur, annee, mois, statutAnnulation);
            return await query.SumAsync(p => p.Montant);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error computing Encaissement total: {ExMessage}", ex.Message);
            throw;
        }
    }

    // RMANew (DataEntryPaiement.vb) : le montant encaissé est imputé sur les factures
    // impayées du bail, les plus anciennes d'abord (Update FactureLoyer set
    // Montant=Montant-... / Etat) - Facture.Montant représente ici le solde restant dû,
    // comme déjà établi dans RelanceService (filtre "Montant > 0").
    public async Task<PaiementResponse> CreateAsync(PaiementRequest request)
    {
        Bail? bail = await context.Baux.FindAsync(request.NoLocation);
        if (bail == null)
        {
            throw new KeyNotFoundException("Bail not found");
        }

        var entity = new Paiement
        {
            NoLocation = request.NoLocation,
            NoEncaisseur = request.NoEncaisseur ?? bail.NoEncaisseur,
            Montant = request.Montant,
            ModePaiement = request.ModePaiement,
            DatePaiement = request.DatePaiement ?? DateTime.UtcNow,
            Reference = request.Reference,
            Notes = request.Notes,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Paiements.Add(entity);
        await context.SaveChangesAsync();

        List<Facture> facturesImpayees = await context.Factures
            .Where(f => f.NoLocation == request.NoLocation && EtatsImpayes.Contains(f.Etat) && f.Montant > 0)
            .OrderBy(f => f.Periode)
            .ToListAsync();

        decimal montantRestant = request.Montant;
        foreach (Facture facture in facturesImpayees)
        {
            if (montantRestant <= 0)
            {
                break;
            }

            decimal montantAAffecter = Math.Min(montantRestant, facture.Montant);
            facture.Montant -= montantAAffecter;
            montantRestant -= montantAAffecter;
            facture.Etat = facture.Montant <= 0 ? "Payée" : "Partiellement payée";

            // RMANew (table Payement) : trace la part de ce paiement affectée à cette
            // facture, pour pouvoir la restituer exactement en cas d'annulation.
            context.PaiementFactures.Add(new PaiementFacture
            {
                NoPaiement = entity.Numero,
                NoFacture = facture.Numero,
                Montant = montantAAffecter,
                AddUser = entity.AddUser,
                AddDate = DateTime.UtcNow,
                ModUser = entity.AddUser,
                ModDate = DateTime.UtcNow
            });
        }

        await context.SaveChangesAsync();

        logger.LogInformation("Paiement with ID {Numero} created successfully for Bail {NoLocation}.", entity.Numero, entity.NoLocation);

        return await ToResponseAsync(entity);
    }

    // RMANew (DataEntryEncaissement.vb, AnnulerEncaissement) : place l'encaissement en
    // attente de confirmation - Bordereau.DemandeAnnulation=1.
    public async Task<PaiementResponse> DemanderAnnulationAsync(int numero)
    {
        Paiement entity = await context.Paiements.FindAsync(numero) ?? throw new KeyNotFoundException("Paiement not found");

        if (entity.Annule || entity.Rejete)
        {
            throw new InvalidOperationException("Cet encaissement est déjà résolu.");
        }

        entity.DemandeAnnulation = true;
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        return await ToResponseAsync(entity);
    }

    // RMANew (AnnulationsEncaissements.vb, RejetEncaissement) : contrairement à ce que le
    // nom suggère, "Rejeter" ne restaure PAS l'encaissement à son état actif - le legacy
    // exécute exactement la même restitution des factures qu'"Annuler" (AnnulerEncaissement
    // et RejetEncaissement ont un corps quasi identique), seul le statut final diffère
    // (Isrejet=1 au lieu de IsAnnuler=1). Les deux terminent dans "Encaissements annulés".
    public Task<PaiementResponse> RejeterAnnulationAsync(int numero) => ResoudreAnnulationAsync(numero, estRejet: true);

    // RMANew (AnnulationsEncaissements.vb, AnnulerEncaissement) : restitue à chaque
    // facture touchée le montant qui lui avait été affecté et remet son état à "Impayée"
    // - imite la remise brute du legacy (etat=0) plutôt qu'un recalcul partiel.
    public Task<PaiementResponse> ConfirmerAnnulationAsync(int numero) => ResoudreAnnulationAsync(numero, estRejet: false);

    private async Task<PaiementResponse> ResoudreAnnulationAsync(int numero, bool estRejet)
    {
        Paiement entity = await context.Paiements.FindAsync(numero) ?? throw new KeyNotFoundException("Paiement not found");

        if (entity.Annule || entity.Rejete)
        {
            throw new InvalidOperationException("Cet encaissement est déjà résolu.");
        }

        List<PaiementFacture> allocations = await context.PaiementFactures
            .Where(pf => pf.NoPaiement == numero)
            .ToListAsync();

        var factureIds = allocations.Select(a => a.NoFacture).Distinct().ToList();
        Dictionary<int, Facture> factures = await context.Factures
            .Where(f => factureIds.Contains(f.Numero))
            .ToDictionaryAsync(f => f.Numero);

        foreach (PaiementFacture allocation in allocations)
        {
            if (factures.TryGetValue(allocation.NoFacture, out Facture? facture))
            {
                facture.Montant += allocation.Montant;
                facture.Etat = "Impayée";
            }
        }

        entity.Annule = !estRejet;
        entity.Rejete = estRejet;
        entity.DemandeAnnulation = false;
        entity.DateAnnulation = DateTime.UtcNow;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return await ToResponseAsync(entity);
    }

    // RMANew (ViewReporting.vb, ExportEtatRejet) : encaissements rejetés (Bordereau.isrejet=1)
    // - "Rejete" ici est le même champ que celui déjà utilisé pour "Encaissements annulés"
    // (voir BuildEncaissementQuery), mais cette liste porte UNIQUEMENT sur les rejets, pas
    // sur les annulations volontaires (Annule), contrairement au filtre "annule" existant
    // qui regroupe les deux (comme RMANew le fait pour l'archive, mais pas pour cet export
    // spécifique). "Banque" (RMANew: Bordereau.Banque, texte libre saisi à la remise) n'a
    // pas d'équivalent sur Paiement ici - colonne absente plutôt qu'inventée.
    public async Task<List<EtatRejetResponse>> GetEtatRejetAsync()
    {
        List<Paiement> paiements = await context.Paiements.Where(p => p.Rejete).ToListAsync();

        var bailIds = paiements.Select(p => p.NoLocation).Distinct().ToList();
        Dictionary<int, Bail> baux = await context.Baux
            .Where(b => bailIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        var buildingIds = baux.Values.Select(b => b.NoBuilding).Distinct().ToList();
        Dictionary<int, Building> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        var locataireIds = baux.Values.Select(b => b.NoLocataire).Distinct().ToList();
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(l => locataireIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        var encaisseurIds = paiements.Where(p => p.NoEncaisseur != null).Select(p => p.NoEncaisseur!.Value).Distinct().ToList();
        Dictionary<int, string> encaisseurs = await context.Encaisseurs
            .Where(e => encaisseurIds.Contains(e.Numero))
            .ToDictionaryAsync(e => e.Numero, e => e.Designation);

        return paiements.Select(p =>
        {
            baux.TryGetValue(p.NoLocation, out Bail? bail);
            Building? building = bail != null && buildings.TryGetValue(bail.NoBuilding, out Building? bd) ? bd : null;
            Locataire? locataire = bail != null && locataires.TryGetValue(bail.NoLocataire, out Locataire? loc) ? loc : null;
            string? nomLocataire = locataire == null
                ? null
                : locataire.TypeLocataire == 1
                    ? locataire.DesignationEntreprise
                    : $"{locataire.Nom} {locataire.Prenom}".Trim();
            string? nomEncaisseur = p.NoEncaisseur != null && encaisseurs.TryGetValue(p.NoEncaisseur.Value, out string? enc) ? enc : null;

            return new EtatRejetResponse
            {
                Numero = p.Numero,
                DatePaiement = p.DatePaiement,
                Montant = p.Montant,
                Reference = p.Reference,
                NomLocataire = nomLocataire,
                NumContratLocations = bail?.NumContratLocations,
                CompteGeneral = building?.CompteGeneral,
                CodeImmeuble = building?.CodeImmeuble,
                NomEncaisseur = nomEncaisseur,
                DateRejet = p.DateAnnulation
            };
        }).ToList();
    }

    private async Task<PaiementResponse> ToResponseAsync(Paiement entity)
    {
        Bail? bail = await context.Baux.FindAsync(entity.NoLocation);

        string? nomBuilding = bail == null ? null : await context.Buildings
            .Where(x => x.Numero == bail.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocataire = null;
        if (bail != null)
        {
            Locataire? locataire = await context.Locataires.FindAsync(bail.NoLocataire);
            if (locataire != null)
            {
                nomLocataire = locataire.TypeLocataire == 1
                    ? locataire.DesignationEntreprise
                    : $"{locataire.Nom} {locataire.Prenom}".Trim();
            }
        }

        string? nomEncaisseur = entity.NoEncaisseur == null
            ? null
            : await context.Encaisseurs.Where(e => e.Numero == entity.NoEncaisseur).Select(e => e.Designation).FirstOrDefaultAsync();

        var periode = await (
                from pf in context.PaiementFactures
                join f in context.Factures on pf.NoFacture equals f.Numero
                where pf.NoPaiement == entity.Numero
                select f.Periode)
            .ToListAsync();

        return new PaiementResponse
        {
            Numero = entity.Numero,
            NoLocation = entity.NoLocation,
            NumContratLocations = bail?.NumContratLocations,
            NomLocataire = nomLocataire,
            NomBuilding = nomBuilding,
            NomEncaisseur = nomEncaisseur,
            Montant = entity.Montant,
            ModePaiement = entity.ModePaiement,
            DatePaiement = entity.DatePaiement,
            Reference = entity.Reference,
            Notes = entity.Notes,
            DemandeAnnulation = entity.DemandeAnnulation,
            Annule = entity.Annule,
            Rejete = entity.Rejete,
            DateAnnulation = entity.DateAnnulation,
            PeriodeDebut = periode.Count > 0 ? periode.Min() : null,
            PeriodeFin = periode.Count > 0 ? periode.Max() : null,
            NumRemiseBancaire = entity.NumRemiseBancaire,
            Genere = entity.Genere,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate
        };
    }

    // RMANew (Classes/ListEncaissement.vb, Importer()) : import en masse d'un fichier à 2
    // colonnes (RefPaiement, NumRemiseBancaire) - associe chaque encaissement dont la
    // Référence correspond à la remise bancaire indiquée. Simple étiquette texte, pas de
    // suivi de solde par remise (mécanisme distinct du formulaire d'édition legacy,
    // non repris ici).
    public async Task<ImporterRemiseResponse> ImporterRemiseAsync(ImporterRemiseRequest request)
    {
        var references = request.Lignes.Select(l => l.RefPaiement).Distinct().ToList();

        List<Paiement> paiements = await context.Paiements
            .Where(p => p.Reference != null && references.Contains(p.Reference))
            .ToListAsync();

        Dictionary<string, List<Paiement>> parReference = paiements
            .GroupBy(p => p.Reference!)
            .ToDictionary(g => g.Key, g => g.ToList());

        int nombreAssocies = 0;
        var introuvables = new List<string>();

        foreach (ImporterRemiseLigne ligne in request.Lignes)
        {
            if (parReference.TryGetValue(ligne.RefPaiement, out List<Paiement>? matches))
            {
                foreach (Paiement paiement in matches)
                {
                    paiement.NumRemiseBancaire = ligne.NumRemiseBancaire;
                    paiement.ModDate = DateTime.UtcNow;
                    nombreAssocies++;
                }
            }
            else
            {
                introuvables.Add(ligne.RefPaiement);
            }
        }

        await context.SaveChangesAsync();

        return new ImporterRemiseResponse { NombreAssocies = nombreAssocies, ReferencesIntrouvables = introuvables };
    }

    // RMANew (Classes/ListEncaissement.vb, GenereEncaissement) : export comptable au format
    // fixe pour les encaissements non encore exportés (Genere=false), en excluant les
    // annulés/rejetés (le legacy n'exclut que IsAnnuler, pas Isrejet - probable oubli, corrigé
    // ici puisqu'un encaissement rejeté n'a pas non plus vocation à être transmis à la
    // comptabilité). Marque les lignes retournées comme générées, pour ne pas les réexporter.
    public async Task<RapportComptableResponse> GenererRapportComptableAsync(int annee, int mois, int noProprietaire)
    {
        IQueryable<Paiement> paiements = context.Paiements
            .Where(p => !p.Genere && !p.Annule && !p.Rejete && p.DatePaiement.Year == annee);

        if (mois > 0)
        {
            paiements = paiements.Where(p => p.DatePaiement.Month == mois);
        }

        var joined =
            from p in paiements
            join b in context.Baux on p.NoLocation equals b.Numero
            join bld in context.Buildings on b.NoBuilding equals bld.Numero
            join loc in context.Locataires on b.NoLocataire equals loc.Numero into locJoin
            from loc in locJoin.DefaultIfEmpty()
            where noProprietaire <= 0 || bld.NoProprietaire == noProprietaire
            select new { p, b, loc };

        var rows = await joined.ToListAsync();

        if (rows.Count == 0)
        {
            return new RapportComptableResponse();
        }

        var encaisseurIds = rows.Where(x => x.p.NoEncaisseur != null).Select(x => x.p.NoEncaisseur!.Value).Distinct().ToList();
        Dictionary<int, string> encaisseurs = await context.Encaisseurs
            .Where(e => encaisseurIds.Contains(e.Numero))
            .ToDictionaryAsync(e => e.Numero, e => e.Designation);

        var lignes = rows.Select(x =>
        {
            bool espece = x.p.ModePaiement == "Espèce";
            string nomLocataire = x.loc == null
                ? ""
                : x.loc.TypeLocataire == 1 ? x.loc.DesignationEntreprise ?? "" : $"{x.loc.Nom} {x.loc.Prenom}".Trim();
            string? nomEncaisseur = x.p.NoEncaisseur != null && encaisseurs.TryGetValue(x.p.NoEncaisseur.Value, out string? enc) ? enc : null;

            return new RapportComptableLigneResponse
            {
                DateComptable = x.p.AddDate.ToString("dd/MM/yyyy"),
                Type = x.p.ModePaiement,
                // RMANew utilise Bordereau.Numero (numéro de l'encaissement lui-même) ici,
                // ce qui semble être une confusion avec le numéro du locataire - on utilise
                // NoLocataire, plus cohérent avec l'intention du champ ("Nom payeur").
                NomPayeur = $"{x.b.NoLocataire} - {nomLocataire}",
                Montant = x.p.Montant.ToString("### ### ##0.##"),
                DateEncaissVirChequeEffet = x.p.DatePaiement.ToString("dd/MM/yyyy"),
                ReferencePaiement = espece ? "--" : x.p.Reference ?? "",
                CompteChequeEffetVirt = espece ? "" : "0000000",
                BanqueVersementChequeEffetVirt = espece ? "" : "011",
                Agence = espece ? "" : "20",
                ComptevermtChqEffetVir = espece ? "" : "228",
                NomEncaisseur = nomEncaisseur ?? "",
                NumRemiseBancaire = x.p.NumRemiseBancaire ?? ""
            };
        }).ToList();

        foreach (var x in rows)
        {
            x.p.Genere = true;
            x.p.ModDate = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();

        return new RapportComptableResponse { Lignes = lignes };
    }
}

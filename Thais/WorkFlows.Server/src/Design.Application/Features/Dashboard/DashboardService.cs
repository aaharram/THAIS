using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Interfaces.Dashboard;
using Design.Contract.Responses;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Dashboard;

// RMANew (Classes/DataEntryLeasing.vb) : le Tableau de bord. RMANew décline ses filtres en
// une quinzaine de branches if/elseif (FonctionFiltre1/FonctionFiltre2) qui assemblent des
// clauses WHERE à la main ; ici les 4 filtres sont d'abord résolus en une liste d'actifs,
// réutilisée par tous les indicateurs - même résultat, sans la combinatoire.
public class DashboardService(DbDesignContext context, ILogger<DashboardService> logger) : IDashboardService
{
    private static readonly string[] MoisAbreges =
        ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

    private IQueryable<Building> FiltrerActifs(int? noProprietaire, int? noCity, int? noLocalType, int? noBuilding)
    {
        IQueryable<Building> query = context.Buildings.Where(b => !b.Inactif);

        if (noProprietaire is > 0)
        {
            query = query.Where(b => b.NoProprietaire == noProprietaire);
        }

        if (noCity is > 0)
        {
            query = query.Where(b => b.NoCity == noCity);
        }

        if (noBuilding is > 0)
        {
            query = query.Where(b => b.Numero == noBuilding);
        }

        // RMANew : le filtre Typologie porte sur Local.NoLocalType et se propage aux
        // actifs via une jointure - un actif est retenu dès qu'il a au moins un local de
        // cette typologie.
        if (noLocalType is > 0)
        {
            query = query.Where(b =>
                context.Locaux.Any(l => l.NoBuilding == b.Numero && !l.Inactif && l.NoLocalType == noLocalType));
        }

        return query;
    }

    public async Task<List<LookupResponse>> GetActifsAsync(int? noProprietaire, int? noCity, int? noLocalType)
    {
        return await FiltrerActifs(noProprietaire, noCity, noLocalType, null)
            .OrderBy(b => b.Designation)
            .Select(b => new LookupResponse { Numero = b.Numero, Designation = b.Designation })
            .ToListAsync();
    }

    public async Task<DashboardResponse> GetAsync(int? noProprietaire, int? noCity, int? noLocalType, int? noBuilding)
    {
        try
        {
            IQueryable<Building> buildingsQuery = FiltrerActifs(noProprietaire, noCity, noLocalType, noBuilding);

            List<int> buildingIds = await buildingsQuery.Select(b => b.Numero).ToListAsync();

            int currentYear = DateTime.UtcNow.Year;

            // ---- Patrimoine géré ----
            IQueryable<Local> locauxQuery = context.Locaux
                .Where(l => !l.Inactif && buildingIds.Contains(l.NoBuilding));
            if (noLocalType is > 0)
            {
                locauxQuery = locauxQuery.Where(l => l.NoLocalType == noLocalType);
            }

            int nbLocaux = await locauxQuery.CountAsync();

            // ---- Loyer prévisionnel annuel ----
            // RMANew (TotauxLoyers) : SUM(Montant)*12 pour la périodicité mensuelle (1),
            // *4 pour la trimestrielle (3), *1 pour l'annuelle (5) - les autres
            // périodicités ne sont pas comptées.
            var bauxActifs = await context.Baux
                .Where(b => buildingIds.Contains(b.NoBuilding) && !b.Inactif
                    && b.Etat == "En cours de location" && b.GenererQuittance)
                .Select(b => new { b.NoBuilding, b.NoLocal, Montant = b.Montant ?? 0, b.NoPeriodicity })
                .ToListAsync();

            decimal AnnualiserLoyer(int? periodicite, decimal montant) => periodicite switch
            {
                1 => montant * 12,
                3 => montant * 4,
                5 => montant,
                _ => 0,
            };

            decimal loyerPrevisionnelAnnuel = bauxActifs.Sum(b => AnnualiserLoyer(b.NoPeriodicity, b.Montant));

            // ---- Budget de charge / Réalisation / Décaissement ----
            var chargesFiltrees = await context.Charges
                .Where(c => buildingIds.Contains(c.NoBuilding) && !c.Inactif)
                .Select(c => new { Montant = c.Montant ?? 0, Realisation = c.Realisation ?? 0, c.DateDecaissement })
                .ToListAsync();

            decimal budgetCharge = chargesFiltrees
                .Where(c => c.DateDecaissement.HasValue && c.DateDecaissement.Value.Year == currentYear)
                .Sum(c => c.Montant);

            decimal montantRealisation = chargesFiltrees.Sum(c => c.Realisation);
            decimal totalMontantCharges = chargesFiltrees.Sum(c => c.Montant);
            decimal tauxRealisation = totalMontantCharges > 0
                ? montantRealisation * 100 / totalMontantCharges
                : 0;

            // RMANew (FacturesPrestataire) : SUM(PrestataireFacture.Montant) - cette table
            // de factures fournisseurs n'a pas d'équivalent côté Smart-Building, on prend
            // la source la plus proche : les lignes de prestation des bons de commande de
            // l'année (déjà utilisées pour "Charges annuelles" de la fiche signalétique).
            decimal montantDecaissement = await context.PrestationsAchat
                .Where(p => buildingIds.Contains(p.NoBuilding) && p.AddDate.Year == currentYear)
                .SumAsync(p => (decimal?)(p.PrixUnitaireHT * p.Quantite)) ?? 0;

            decimal tauxDecaissement = budgetCharge > 0
                ? Math.Min(montantDecaissement * 100 / budgetCharge, 100)
                : 0;

            // ---- Taux d'occupation ----
            // RMANew (LotOccupéGlobal) : locaux avec Occupation=1 / total des locaux. Ce schéma ne porte pas ce
            // drapeau sur Local : un local est occupé s'il a un bail « En cours de location » (même règle que la
            // liste des locaux vacants). Contrairement au loyer prévisionnel, l'occupation ne dépend pas de
            // GenererQuittance : un bail qui ne génère pas de quittances occupe quand même son local.
            List<int> locauxIds = await locauxQuery.Select(l => l.Numero).ToListAsync();
            List<int> locauxLoues = await context.Baux
                .Where(b => buildingIds.Contains(b.NoBuilding) && !b.Inactif && b.Etat == "En cours de location")
                .Select(b => b.NoLocal)
                .Distinct()
                .ToListAsync();
            int nbLocauxOccupes = locauxLoues.Count(locauxIds.Contains);

            // Détail de chaque local pour l'infobulle de la façade : le bail en cours (le plus récent) donne
            // le locataire et le loyer ; sans bail en cours, le local est vacant.
            var baux = await context.Baux
                .Where(b => buildingIds.Contains(b.NoBuilding) && !b.Inactif && b.Etat == "En cours de location")
                .OrderByDescending(b => b.Numero)
                .Select(b => new { b.NoLocal, b.NoLocataire, b.Montant })
                .ToListAsync();
            Dictionary<int, int> locatairePourLocal = new();
            Dictionary<int, decimal?> loyerPourLocal = new();
            foreach (var b in baux)
            {
                locatairePourLocal.TryAdd(b.NoLocal, b.NoLocataire);
                loyerPourLocal.TryAdd(b.NoLocal, b.Montant);
            }
            List<int> locatairesIds = locatairePourLocal.Values.Distinct().ToList();
            Dictionary<int, string> nomsLocataires = (await context.Locataires
                .Where(l => locatairesIds.Contains(l.Numero))
                .Select(l => new { l.Numero, l.TypeLocataire, l.DesignationEntreprise, l.Nom, l.Prenom })
                .ToListAsync())
                .ToDictionary(
                    l => l.Numero,
                    l => (l.TypeLocataire == 1 ? l.DesignationEntreprise : $"{l.Nom} {l.Prenom}".Trim()) ?? "");
            Dictionary<int, string> nomsActifs = await context.Buildings
                .Where(b => buildingIds.Contains(b.Numero))
                .ToDictionaryAsync(b => b.Numero, b => b.Designation);
            Dictionary<int, string> typesLocaux = await context.LocalTypes
                .ToDictionaryAsync(t => t.Numero, t => t.Designation);

            List<DashboardLocalResponse> locauxDetail = (await locauxQuery
                .Select(l => new { l.Numero, l.Designation, l.NoBuilding, l.NoLocalType, l.Etage, l.Surface })
                .ToListAsync())
                .Select(l => new DashboardLocalResponse
                {
                    Numero = l.Numero,
                    Designation = l.Designation,
                    Actif = nomsActifs.GetValueOrDefault(l.NoBuilding),
                    Type = l.NoLocalType is int t ? typesLocaux.GetValueOrDefault(t) : null,
                    Etage = l.Etage,
                    Surface = l.Surface,
                    Occupe = locatairePourLocal.ContainsKey(l.Numero),
                    Locataire = locatairePourLocal.TryGetValue(l.Numero, out int noLocataire)
                        ? nomsLocataires.GetValueOrDefault(noLocataire)
                        : null,
                    Loyer = loyerPourLocal.GetValueOrDefault(l.Numero),
                })
                .OrderByDescending(l => l.Occupe)
                .ThenBy(l => l.Actif)
                .ThenBy(l => l.Designation)
                .ToList();
            decimal tauxOccupation = nbLocaux > 0
                ? Math.Min((decimal)nbLocauxOccupes * 100 / nbLocaux, 100)
                : 0;

            // ---- Rendement ----
            // RMANew (Rendement/TLoyersExploitation) : loyers annuels des seuls actifs
            // valorisés (Building.ValeurEntree>0) rapportés à la somme de ces valeurs
            // d'entrée. Smart-Building n'a pas de champ ValeurEntree : on reprend la même
            // substitution que la fiche signalétique (Terrain + Construction + Aménagement).
            var valeursActifs = await buildingsQuery
                .Select(b => new
                {
                    b.Numero,
                    Valeur = (b.ValeurEntreeTerrain ?? 0) + (b.ValeurEntreeConstruction ?? 0) + (b.ValeurAmenagement ?? 0),
                })
                .Where(x => x.Valeur > 0)
                .ToListAsync();

            decimal totalValeurEntree = valeursActifs.Sum(x => x.Valeur);
            HashSet<int> actifsValorises = valeursActifs.Select(x => x.Numero).ToHashSet();
            decimal loyersActifsValorises = bauxActifs
                .Where(b => actifsValorises.Contains(b.NoBuilding))
                .Sum(b => AnnualiserLoyer(b.NoPeriodicity, b.Montant));

            decimal rendement = totalValeurEntree > 0
                ? loyersActifsValorises * 100 / totalValeurEntree
                : 0;

            // ---- Encaissements ----
            // Factures et paiements sont rattachés au bail (NoLocation), pas directement à
            // l'actif : on passe par les baux des actifs filtrés.
            List<int> bailIds = await context.Baux
                .Where(b => buildingIds.Contains(b.NoBuilding))
                .Select(b => b.Numero)
                .ToListAsync();

            var facturesAnnee = await context.Factures
                .Where(f => bailIds.Contains(f.NoLocation) && f.Etat != "Annulée" && f.Periode.Year == currentYear)
                .Select(f => new { f.Montant, f.Periode })
                .ToListAsync();

            var paiementsAnnee = await context.Paiements
                .Where(p => bailIds.Contains(p.NoLocation) && !p.Annule && !p.Rejete && p.DatePaiement.Year == currentYear)
                .Select(p => new { p.Montant, p.DatePaiement })
                .ToListAsync();

            decimal montantEncaissements = paiementsAnnee.Sum(p => p.Montant);
            decimal totalQuittance = facturesAnnee.Sum(f => f.Montant);
            decimal tauxEncaissement = totalQuittance > 0
                ? Math.Min(montantEncaissements * 100 / totalQuittance, 100)
                : 0;

            // ---- Quittancés vs Encaissés (6 derniers mois) ----
            // RMANew (GetComparatifLoyers) : fenêtre glissante de 6 mois se terminant au
            // mois courant (et démarrant en janvier tant qu'on est avant juillet).
            int moisFin = Math.Max(DateTime.UtcNow.Month, 6);
            var serie = new List<DashboardMoisResponse>();
            for (int mois = moisFin - 5; mois <= moisFin; mois++)
            {
                serie.Add(new DashboardMoisResponse
                {
                    Annee = currentYear,
                    Mois = mois,
                    Libelle = MoisAbreges[mois - 1],
                    Quittance = facturesAnnee.Where(f => f.Periode.Month == mois).Sum(f => f.Montant),
                    Encaisse = paiementsAnnee.Where(p => p.DatePaiement.Month == mois).Sum(p => p.Montant),
                });
            }

            return new DashboardResponse
            {
                NbActifs = buildingIds.Count,
                NbLocaux = nbLocaux,
                LoyerPrevisionnelAnnuel = loyerPrevisionnelAnnuel,
                BudgetCharge = budgetCharge,
                TauxOccupation = Math.Round(tauxOccupation, 0),
                MontantRealisation = montantRealisation,
                TauxRealisation = Math.Round(tauxRealisation, 0),
                Rendement = Math.Round(rendement, 2),
                MontantEncaissements = montantEncaissements,
                TauxEncaissement = Math.Round(tauxEncaissement, 0),
                MontantDecaissement = montantDecaissement,
                TauxDecaissement = Math.Round(tauxDecaissement, 0),
                QuittancesVsEncaisses = serie,
                Locaux = locauxDetail,
            };
        }
        catch (Exception ex)
        {
            logger.LogError("Error building dashboard: {ExMessage}", ex.Message);
            throw;
        }
    }
}

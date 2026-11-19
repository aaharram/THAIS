using Microsoft.EntityFrameworkCore;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Responses;
using Design.Domain.Entities.Configuration;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Leasing;

// Regroupe 5 rapports RMANew qui, une fois le code legacy lu, ne nécessitaient aucune
// nouvelle table - juste de nouvelles agrégations sur Bail/Facture/Paiement/PaiementFacture
// déjà en place (le "Bordereau" de RMANew correspond déjà à l'entité Paiement ici, voir ses
// commentaires XML). ListEtatImpaye.aspx s'est avéré être du code mort (copie de la page
// Achats, colonnes toujours vides) - reconstruit ici depuis zéro, pas porté.
public class RapportsRecouvrementService(DbDesignContext context)
    : IRapportsRecouvrementService
{
    private static readonly string[] TypesLoyer = ["LoyerM", "Loyer"];
    private const string EtatImpayee = "Impayée";
    private const string EtatPartielle = "Partiellement payée";
    private const string EtatPayee = "Payée";
    private const string EtatAnnulee = "Annulée";

    private static DateTime EndOfMonth(DateTime d) => new DateTime(d.Year, d.Month, 1).AddMonths(1).AddDays(-1);

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

    public async Task<EtatImpayeResponse> GetEtatImpayeAsync()
    {
        DateTime today = DateTime.UtcNow.Date;

        List<Building> buildings = await context.Buildings.Where(b => !b.Inactif).ToListAsync();
        List<int> buildingIds = buildings.Select(b => b.Numero).ToList();

        List<Bail> baux = await context.Baux.Where(b => buildingIds.Contains(b.NoBuilding)).ToListAsync();
        List<int> bailIds = baux.Select(b => b.Numero).ToList();

        List<Facture> facturesImpayees = await context.Factures
            .Where(f => bailIds.Contains(f.NoLocation) && TypesLoyer.Contains(f.TypeFacture) &&
                        (f.Etat == EtatImpayee || f.Etat == EtatPartielle) && f.Periode <= today)
            .ToListAsync();
        List<int> factureIds = facturesImpayees.Select(f => f.Numero).ToList();

        Dictionary<int, decimal> soldeParFacture = (await context.PaiementFactures
                .Where(pf => factureIds.Contains(pf.NoFacture))
                .ToListAsync())
            .GroupBy(pf => pf.NoFacture)
            .ToDictionary(g => g.Key, g => g.Sum(pf => pf.Montant));

        Dictionary<int, string> proprietaires = await context.Proprietaires
            .ToDictionaryAsync(p => p.Numero, p => p.Designation);

        var response = new EtatImpayeResponse();

        foreach (IGrouping<int?, Building> groupe in buildings.GroupBy(b => b.NoProprietaire))
        {
            List<int> bailIdsProprietaire = baux
                .Where(b => groupe.Select(g => g.Numero).Contains(b.NoBuilding))
                .Select(b => b.Numero)
                .ToList();

            decimal montantImpaye = 0;
            int nbDossiers = 0;
            foreach (int bailId in bailIdsProprietaire)
            {
                decimal impaye = facturesImpayees
                    .Where(f => f.NoLocation == bailId)
                    .Sum(f => Math.Max(0, f.Montant - soldeParFacture.GetValueOrDefault(f.Numero)));
                if (impaye > 0)
                {
                    montantImpaye += impaye;
                    nbDossiers++;
                }
            }

            if (montantImpaye <= 0)
            {
                continue;
            }

            response.Lignes.Add(new EtatImpayeLigneResponse
            {
                NoProprietaire = groupe.Key,
                Proprietaire = groupe.Key.HasValue ? proprietaires.GetValueOrDefault(groupe.Key.Value) : null,
                MontantImpaye = montantImpaye,
                NbDossiers = nbDossiers
            });
        }

        response.TotalImpaye = response.Lignes.Sum(l => l.MontantImpaye);
        response.TotalDossiers = response.Lignes.Sum(l => l.NbDossiers);
        return response;
    }

    public async Task<ApercuEmissionsEncaissementResponse> GetApercuEmissionsEncaissementAsync(int annee, int mois)
    {
        DateTime periodStart = new(annee, mois, 1);
        DateTime periodEnd = EndOfMonth(periodStart);

        List<Facture> factures = await context.Factures
            .Where(f => TypesLoyer.Contains(f.TypeFacture) && f.Etat != EtatAnnulee &&
                        f.Periode >= periodStart && f.Periode <= periodEnd)
            .ToListAsync();
        decimal totalEmissions = factures.Sum(f => f.Montant);

        decimal totalEncaissement = await context.Paiements
            .Where(p => !p.Annule && p.DatePaiement >= periodStart && p.DatePaiement <= periodEnd)
            .SumAsync(p => p.Montant);

        return new ApercuEmissionsEncaissementResponse
        {
            Annee = annee,
            Mois = mois,
            TotalEmissions = totalEmissions,
            TotalEncaissement = totalEncaissement,
            TauxEncaissement = totalEmissions > 0 ? Math.Round(totalEncaissement / totalEmissions * 100, 2) : 0,
            NbFactures = factures.Count
        };
    }

    public async Task<SuiviEncaissementResponse> GetSuiviEncaissementAsync(
        int annee, int mois, int? noEncaisseur, int? noBuilding)
    {
        DateTime periodStart = new(annee, mois, 1);
        DateTime periodEnd = EndOfMonth(periodStart);

        IQueryable<Paiement> paiementsQuery = context.Paiements
            .Where(p => !p.Annule && p.DatePaiement >= periodStart && p.DatePaiement <= periodEnd);
        if (noEncaisseur.HasValue)
        {
            paiementsQuery = paiementsQuery.Where(p => p.NoEncaisseur == noEncaisseur.Value);
        }

        List<Paiement> paiements = await paiementsQuery.ToListAsync();
        List<int> bailIds = paiements.Select(p => p.NoLocation).Distinct().ToList();

        List<Bail> baux = await context.Baux.Where(b => bailIds.Contains(b.Numero)).ToListAsync();
        if (noBuilding.HasValue)
        {
            List<int> bailIdsBuilding = baux.Where(b => b.NoBuilding == noBuilding.Value).Select(b => b.Numero).ToList();
            paiements = paiements.Where(p => bailIdsBuilding.Contains(p.NoLocation)).ToList();
            baux = baux.Where(b => b.NoBuilding == noBuilding.Value).ToList();
        }

        Dictionary<int, Bail> bauxParId = baux.ToDictionary(b => b.Numero);
        List<int> buildingIds = baux.Select(b => b.NoBuilding).Distinct().ToList();
        List<int> localIds = baux.Select(b => b.NoLocal).Distinct().ToList();

        Dictionary<int, Building> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero)).ToDictionaryAsync(b => b.Numero);
        Dictionary<int, Local> locaux = await context.Locaux
            .Where(l => localIds.Contains(l.Numero)).ToDictionaryAsync(l => l.Numero);
        Dictionary<int, string> encaisseurs = await context.Encaisseurs
            .ToDictionaryAsync(e => e.Numero, e => e.Designation);

        var response = new SuiviEncaissementResponse();

        foreach (IGrouping<int, Paiement> groupe in paiements
                     .Where(p => bauxParId.ContainsKey(p.NoLocation))
                     .GroupBy(p => bauxParId[p.NoLocation].NoBuilding))
        {
            if (!buildings.TryGetValue(groupe.Key, out Building? building))
            {
                continue;
            }

            var buildingResponse = new SuiviEncaissementBuildingResponse
            {
                NoBuilding = building.Numero,
                Immeuble = building.Designation,
                CodeImmeuble = building.CodeImmeuble
            };

            foreach (Paiement paiement in groupe)
            {
                Bail bail = bauxParId[paiement.NoLocation];
                Local? local = locaux.GetValueOrDefault(bail.NoLocal);
                string? nomLocataire = await ResolveNomLocataireAsync(bail.NoLocataire);

                buildingResponse.Lignes.Add(new SuiviEncaissementLigneResponse
                {
                    NoPaiement = paiement.Numero,
                    Locataire = nomLocataire,
                    Etage = local?.Etage,
                    Local = local?.Designation,
                    ModePaiement = paiement.ModePaiement,
                    DatePaiement = paiement.DatePaiement,
                    Montant = paiement.Montant,
                    Encaisseur = paiement.NoEncaisseur.HasValue
                        ? encaisseurs.GetValueOrDefault(paiement.NoEncaisseur.Value)
                        : null,
                    LoyerNet = bail.LoyerNet,
                    Charges = bail.Charges,
                    Taxe = bail.Taxe,
                    TVA = bail.TVA,
                    TotalMois = bail.Montant
                });
            }

            // RMANew (ListSuiviEncaissement.vb) : le total par immeuble sommait
            // Location.Montant (loyer théorique) au lieu de Bordereau.Montant (encaissement
            // réel) - bug corrigé ici, le total reflète l'encaissement effectif.
            buildingResponse.TotalEncaissement = buildingResponse.Lignes.Sum(l => l.Montant);
            response.Buildings.Add(buildingResponse);
        }

        response.GrandTotal = response.Buildings.Sum(b => b.TotalEncaissement);
        return response;
    }

    public async Task<RapportEncaisseurResponse> GetRapportEncaisseurAsync(int annee, int? noEncaisseur)
    {
        DateTime anneeStart = new(annee, 1, 1);
        DateTime anneeEnd = new(annee, 12, 31);

        List<Bail> baux = noEncaisseur.HasValue
            ? await context.Baux.Where(b => b.NoEncaisseur == noEncaisseur.Value).ToListAsync()
            : [];
        List<int>? bailIds = noEncaisseur.HasValue ? baux.Select(b => b.Numero).ToList() : null;

        IQueryable<Facture> facturesQuery = context.Factures
            .Where(f => TypesLoyer.Contains(f.TypeFacture) && f.Etat != EtatAnnulee &&
                        f.Periode >= anneeStart && f.Periode <= anneeEnd);
        if (bailIds != null)
        {
            facturesQuery = facturesQuery.Where(f => bailIds.Contains(f.NoLocation));
        }

        List<Facture> factures = await facturesQuery.ToListAsync();

        var response = new RapportEncaisseurResponse { Annee = annee, NoEncaisseur = noEncaisseur };

        for (int mois = 1; mois <= 12; mois++)
        {
            List<Facture> facturesMois = factures.Where(f => f.Periode.Month == mois).ToList();
            decimal emissions = facturesMois.Sum(f => f.Montant);
            decimal encaissementPaye = facturesMois.Where(f => f.Etat == EtatPayee).Sum(f => f.Montant);

            if (emissions == 0 && facturesMois.Count == 0)
            {
                continue;
            }

            response.Lignes.Add(new RapportEncaisseurLigneResponse
            {
                Mois = mois,
                Emissions = emissions,
                Encaissement = encaissementPaye,
                NbFactures = facturesMois.Count,
                TauxEncaissement = emissions > 0 ? Math.Round(encaissementPaye / emissions * 100, 2) : 0
            });
        }

        response.TotalEmissions = response.Lignes.Sum(l => l.Emissions);
        response.TotalEncaissement = response.Lignes.Sum(l => l.Encaissement);
        response.TauxGlobal = response.TotalEmissions > 0
            ? Math.Round(response.TotalEncaissement / response.TotalEmissions * 100, 2)
            : 0;

        return response;
    }

    // RMANew (ListPrimeEncaisseur.vb) : forfait 9 MAD/facture payée du mois en cours + 3
    // MAD/facture du mois précédent, plus un bonus par palier de taux d'encaissement. Les
    // paliers legacy ("76>Pourcentage>85" / "70>Pourcentage>75") sont des comparaisons
    // chaînées mal formées en VB - toujours fausses, donc en pratique seuls les paliers
    // ">85" et "sinon" s'appliquaient jamais réellement. Corrigé ici avec les seuils
    // manifestement voulus (85+/76-85/70-75/sinon) plutôt que reproduit tel quel - à valider
    // avec le métier si ce n'est pas le comportement souhaité.
    private const decimal ForfaitFactureMoisCourant = 9m;
    private const decimal ForfaitFactureMoisPrecedent = 3m;

    private static decimal ComputeBonus(decimal? pourcentage)
    {
        if (pourcentage == null)
        {
            return 0;
        }

        return pourcentage switch
        {
            > 85 => 400,
            >= 76 and <= 85 => 300,
            >= 70 and < 76 => 150,
            _ => 0
        };
    }

    public async Task<PrimeEncaisseurResponse> GetPrimeEncaisseurAsync(int annee, int mois)
    {
        DateTime periodStart = new(annee, mois, 1);
        DateTime periodEnd = EndOfMonth(periodStart);
        DateTime prevStart = periodStart.AddMonths(-1);
        DateTime prevEnd = EndOfMonth(prevStart);

        List<Encaisseur> encaisseurs = await context.Encaisseurs.ToListAsync();
        List<Bail> baux = await context.Baux.Where(b => b.NoEncaisseur != null).ToListAsync();

        List<Facture> factures = await context.Factures
            .Where(f => TypesLoyer.Contains(f.TypeFacture) && f.Etat != EtatAnnulee &&
                        f.Periode >= prevStart && f.Periode <= periodEnd)
            .ToListAsync();

        List<Paiement> paiements = await context.Paiements
            .Where(p => !p.Annule && p.DatePaiement >= periodStart && p.DatePaiement <= periodEnd)
            .ToListAsync();

        var response = new PrimeEncaisseurResponse { Annee = annee, Mois = mois };

        foreach (Encaisseur encaisseur in encaisseurs)
        {
            List<int> bailIdsEncaisseur = baux.Where(b => b.NoEncaisseur == encaisseur.Numero)
                .Select(b => b.Numero).ToList();

            List<Facture> facturesCourant = factures
                .Where(f => bailIdsEncaisseur.Contains(f.NoLocation) &&
                            f.Periode >= periodStart && f.Periode <= periodEnd)
                .ToList();
            List<Facture> facturesPrecedent = factures
                .Where(f => bailIdsEncaisseur.Contains(f.NoLocation) &&
                            f.Periode >= prevStart && f.Periode <= prevEnd)
                .ToList();

            decimal emission = facturesCourant.Sum(f => f.Montant);
            decimal encaissement = paiements.Where(p => p.NoEncaisseur == encaisseur.Numero).Sum(p => p.Montant);

            if (emission == 0 && encaissement == 0 && facturesPrecedent.Count == 0)
            {
                continue;
            }

            int nbCourant = facturesCourant.Count(f => f.Etat == EtatPayee);
            int nbPrecedent = facturesPrecedent.Count(f => f.Etat == EtatPayee);
            decimal? pourcentage = emission > 0 ? Math.Round(encaissement / emission * 100, 2) : null;
            decimal primeForfait = nbCourant * ForfaitFactureMoisCourant + nbPrecedent * ForfaitFactureMoisPrecedent;
            decimal bonus = ComputeBonus(pourcentage);

            response.Lignes.Add(new PrimeEncaisseurLigneResponse
            {
                NoEncaisseur = encaisseur.Numero,
                Encaisseur = encaisseur.Designation,
                NbFacturesMoisCourant = nbCourant,
                NbFacturesMoisPrecedent = nbPrecedent,
                Emission = emission,
                Encaissement = encaissement,
                Pourcentage = pourcentage,
                PrimeForfait = primeForfait,
                Bonus = bonus,
                TotalPrime = primeForfait + bonus
            });
        }

        response.TotalPrime = response.Lignes.Sum(l => l.TotalPrime);
        return response;
    }
}

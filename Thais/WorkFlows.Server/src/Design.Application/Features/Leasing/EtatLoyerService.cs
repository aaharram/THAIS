using Microsoft.EntityFrameworkCore;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Leasing;

// RMANew (ViewPageEtatdesloyers.aspx / HistoriqueEtatdesloyers.aspx) : état mensuel
// loyers facturés vs encaissés par actif, avec verrouillage/instantané via
// OrdreValidationEtatsLoyers + HistoriqueEtatLoyer. Le schéma RMANew stocke Impayé/NbMois
// impayé directement sur Location (dénormalisé, mis à jour par des triggers/jobs legacy
// absents ici) - la nouvelle app les recalcule à la volée à partir de Facture/PaiementFacture
// (Facture.Etat + solde restant par facture), ce qui est la source de vérité de toute façon.
public class EtatLoyerService(DbDesignContext context) : IEtatLoyerService
{
    private static readonly string[] TypesLoyer = ["LoyerM", "Loyer"];
    private const string EtatImpayee = "Impayée";
    private const string EtatPartielle = "Partiellement payée";
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

    public async Task<EtatLoyerResponse> GetEtatLoyerAsync(int annee, int mois, int? noBuilding, int? noProprietaire)
    {
        DateTime periodStart = new(annee, mois, 1);
        DateTime periodEnd = EndOfMonth(periodStart);
        DateTime dateLimitePai = EndOfMonth(periodStart.AddMonths(1));

        IQueryable<Building> buildingsQuery = context.Buildings.Where(b => !b.Inactif);
        if (noBuilding.HasValue)
        {
            buildingsQuery = buildingsQuery.Where(b => b.Numero == noBuilding.Value);
        }

        if (noProprietaire.HasValue)
        {
            buildingsQuery = buildingsQuery.Where(b => b.NoProprietaire == noProprietaire.Value);
        }

        List<Building> buildings = await buildingsQuery.ToListAsync();
        List<int> buildingIds = buildings.Select(b => b.Numero).ToList();

        List<Bail> baux = await context.Baux.Where(b => buildingIds.Contains(b.NoBuilding)).ToListAsync();
        List<int> bailIds = baux.Select(b => b.Numero).ToList();

        // Toutes les factures loyer non annulées jusqu'à la fin de la période (nécessaire
        // pour l'impayé cumulé, pas seulement celles émises ce mois-ci).
        List<Facture> factures = await context.Factures
            .Where(f => bailIds.Contains(f.NoLocation) && TypesLoyer.Contains(f.TypeFacture) &&
                        f.Etat != EtatAnnulee && f.Periode <= periodEnd)
            .ToListAsync();
        List<int> factureIds = factures.Select(f => f.Numero).ToList();

        List<PaiementFacture> paiementFactures = await context.PaiementFactures
            .Where(pf => factureIds.Contains(pf.NoFacture))
            .ToListAsync();

        List<Paiement> paiementsPeriode = await context.Paiements
            .Where(p => bailIds.Contains(p.NoLocation) && !p.Annule &&
                        p.DatePaiement >= periodStart && p.DatePaiement <= periodEnd)
            .ToListAsync();

        Dictionary<int, decimal> soldeParFacture = paiementFactures
            .GroupBy(pf => pf.NoFacture)
            .ToDictionary(g => g.Key, g => g.Sum(pf => pf.Montant));

        var response = new EtatLoyerResponse { Annee = annee, Mois = mois };

        OrdreValidationEtatLoyer? ordre = await context.OrdresValidationEtatLoyer
            .FirstOrDefaultAsync(o => o.Annee == annee && o.Mois == mois);
        response.Valide = ordre != null;
        response.DateValidation = ordre?.DateValidation;

        foreach (Building building in buildings)
        {
            List<Bail> bauxBuilding = baux.Where(b => b.NoBuilding == building.Numero).ToList();
            var buildingResponse = new EtatLoyerBuildingResponse
            {
                NoBuilding = building.Numero,
                Immeuble = building.Designation,
                CodeImmeuble = building.CodeImmeuble,
                CompteGeneral = building.CompteGeneral,
                NAffectation = building.NAffectation
            };

            foreach (Bail bail in bauxBuilding)
            {
                decimal revenu = factures
                    .Where(f => f.NoLocation == bail.Numero && f.Periode.Year == annee && f.Periode.Month == mois)
                    .Sum(f => f.Montant);

                List<Paiement> paiementsBail = paiementsPeriode.Where(p => p.NoLocation == bail.Numero).ToList();
                decimal encaissement = paiementsBail.Sum(p => p.Montant);
                List<int> paiementIdsBail = paiementsBail.Select(p => p.Numero).ToList();

                List<int> facturesPeriodeIds = factures
                    .Where(f => f.NoLocation == bail.Numero && f.Periode.Year == annee && f.Periode.Month == mois)
                    .Select(f => f.Numero)
                    .ToList();

                decimal enc = paiementFactures
                    .Where(pf => paiementIdsBail.Contains(pf.NoPaiement) && facturesPeriodeIds.Contains(pf.NoFacture))
                    .Sum(pf => pf.Montant);
                decimal autres = encaissement - enc;

                List<Facture> facturesImpayees = factures
                    .Where(f => f.NoLocation == bail.Numero && (f.Etat == EtatImpayee || f.Etat == EtatPartielle))
                    .ToList();

                decimal impaye = facturesImpayees.Sum(f =>
                    Math.Max(0, f.Montant - soldeParFacture.GetValueOrDefault(f.Numero)));
                int nbMoisImpaye = facturesImpayees
                    .Where(f => f.Montant - soldeParFacture.GetValueOrDefault(f.Numero) > 0.01m)
                    .Select(f => new { f.Periode.Year, f.Periode.Month })
                    .Distinct()
                    .Count();

                // RMANew : (ImpayesEncours OU actif) ET (loyer>0 OU ImpayesEncours) — adapté
                // ici avec l'impayé recalculé à la place du flag ImpayesEncours dénormalisé.
                bool inclure = (impaye > 0 || !bail.Inactif) && ((bail.Montant ?? 0) > 0 || impaye > 0);
                if (!inclure)
                {
                    continue;
                }

                string? nomLocataire = await ResolveNomLocataireAsync(bail.NoLocataire);

                buildingResponse.Lignes.Add(new EtatLoyerLigneResponse
                {
                    NoLocation = bail.Numero,
                    NumContratLocations = bail.NumContratLocations,
                    Locataire = nomLocataire,
                    Revenu = revenu,
                    Encaissement = encaissement,
                    Enc = enc,
                    Autres = autres,
                    Impaye = impaye,
                    NbMoisImpaye = nbMoisImpaye,
                    DateLimitePai = revenu > 0 ? dateLimitePai : null
                });
            }

            // Totaux par immeuble : agrégés sur TOUS les baux de l'immeuble (pas seulement
            // les lignes affichées), fidèle à ListEtatdesloyers.vb dont les totaux viennent
            // de requêtes GROUP BY séparées de la liste détail.
            List<int> tousBailIdsBuilding = bauxBuilding.Select(b => b.Numero).ToList();
            buildingResponse.RevenuTotal = factures
                .Where(f => tousBailIdsBuilding.Contains(f.NoLocation) &&
                            f.Periode.Year == annee && f.Periode.Month == mois)
                .Sum(f => f.Montant);
            buildingResponse.EncaissementTotal = paiementsPeriode
                .Where(p => tousBailIdsBuilding.Contains(p.NoLocation))
                .Sum(p => p.Montant);
            buildingResponse.ImpayeTotal = tousBailIdsBuilding.Sum(bailId =>
            {
                decimal impayeBail = factures
                    .Where(f => f.NoLocation == bailId && (f.Etat == EtatImpayee || f.Etat == EtatPartielle))
                    .Sum(f => Math.Max(0, f.Montant - soldeParFacture.GetValueOrDefault(f.Numero)));
                return impayeBail;
            });

            response.Buildings.Add(buildingResponse);
        }

        response.RevenuGrandTotal = response.Buildings.Sum(b => b.RevenuTotal);
        response.EncaissementGrandTotal = response.Buildings.Sum(b => b.EncaissementTotal);
        response.ImpayeGrandTotal = response.Buildings.Sum(b => b.ImpayeTotal);

        return response;
    }

    public async Task<EtatLoyerResponse> ValiderAsync(ValiderEtatLoyerRequest request)
    {
        bool dejaValidee = await context.OrdresValidationEtatLoyer
            .AnyAsync(o => o.Annee == request.Annee && o.Mois == request.Mois);
        if (dejaValidee)
        {
            throw new InvalidOperationException("Cette période a déjà été validée.");
        }

        EtatLoyerResponse etat = await GetEtatLoyerAsync(request.Annee, request.Mois, null, null);

        DateTime now = DateTime.UtcNow;
        foreach (EtatLoyerBuildingResponse building in etat.Buildings)
        {
            foreach (EtatLoyerLigneResponse ligne in building.Lignes)
            {
                context.HistoriquesEtatLoyer.Add(new HistoriqueEtatLoyer
                {
                    Annee = request.Annee,
                    Mois = request.Mois,
                    NoBuilding = building.NoBuilding,
                    Immeuble = building.Immeuble,
                    CodeImmeuble = building.CodeImmeuble,
                    CompteGeneral = building.CompteGeneral,
                    NoLocation = ligne.NoLocation,
                    NumContratLocations = ligne.NumContratLocations,
                    Locataire = ligne.Locataire,
                    Revenu = ligne.Revenu,
                    Encaissement = ligne.Encaissement,
                    Enc = ligne.Enc,
                    Autres = ligne.Autres,
                    Impaye = ligne.Impaye,
                    NbMoisImpaye = ligne.NbMoisImpaye,
                    DateLimitePai = ligne.DateLimitePai,
                    AddUser = request.ValidePar,
                    AddDate = now,
                    ModUser = request.ValidePar,
                    ModDate = now
                });
            }
        }

        context.OrdresValidationEtatLoyer.Add(new OrdreValidationEtatLoyer
        {
            Annee = request.Annee,
            Mois = request.Mois,
            DateValidation = now,
            ValidePar = request.ValidePar,
            AddUser = request.ValidePar,
            AddDate = now,
            ModUser = request.ValidePar,
            ModDate = now
        });

        await context.SaveChangesAsync();

        etat.Valide = true;
        etat.DateValidation = now;
        return etat;
    }

    public async Task<EtatLoyerResponse> GetHistoriqueAsync(int annee, int mois, int? noBuilding, int? noProprietaire)
    {
        List<HistoriqueEtatLoyer> lignes = await context.HistoriquesEtatLoyer
            .Where(h => h.Annee == annee && h.Mois == mois)
            .ToListAsync();

        if (noBuilding.HasValue)
        {
            lignes = lignes.Where(h => h.NoBuilding == noBuilding.Value).ToList();
        }

        if (noProprietaire.HasValue)
        {
            List<int> buildingIdsProprietaire = await context.Buildings
                .Where(b => b.NoProprietaire == noProprietaire.Value)
                .Select(b => b.Numero)
                .ToListAsync();
            lignes = lignes.Where(h => buildingIdsProprietaire.Contains(h.NoBuilding)).ToList();
        }

        OrdreValidationEtatLoyer? ordre = await context.OrdresValidationEtatLoyer
            .FirstOrDefaultAsync(o => o.Annee == annee && o.Mois == mois);

        var response = new EtatLoyerResponse
        {
            Annee = annee,
            Mois = mois,
            Valide = ordre != null,
            DateValidation = ordre?.DateValidation
        };

        foreach (IGrouping<int, HistoriqueEtatLoyer> groupe in lignes.GroupBy(h => h.NoBuilding))
        {
            HistoriqueEtatLoyer premiere = groupe.First();
            var buildingResponse = new EtatLoyerBuildingResponse
            {
                NoBuilding = groupe.Key,
                Immeuble = premiere.Immeuble,
                CodeImmeuble = premiere.CodeImmeuble,
                CompteGeneral = premiere.CompteGeneral,
                RevenuTotal = groupe.Sum(h => h.Revenu),
                EncaissementTotal = groupe.Sum(h => h.Encaissement),
                ImpayeTotal = groupe.Sum(h => h.Impaye)
            };

            buildingResponse.Lignes.AddRange(groupe.Select(h => new EtatLoyerLigneResponse
            {
                NoLocation = h.NoLocation,
                NumContratLocations = h.NumContratLocations,
                Locataire = h.Locataire,
                Revenu = h.Revenu,
                Encaissement = h.Encaissement,
                Enc = h.Enc,
                Autres = h.Autres,
                Impaye = h.Impaye,
                NbMoisImpaye = h.NbMoisImpaye,
                DateLimitePai = h.DateLimitePai
            }));

            response.Buildings.Add(buildingResponse);
        }

        response.RevenuGrandTotal = response.Buildings.Sum(b => b.RevenuTotal);
        response.EncaissementGrandTotal = response.Buildings.Sum(b => b.EncaissementTotal);
        response.ImpayeGrandTotal = response.Buildings.Sum(b => b.ImpayeTotal);

        return response;
    }

    public async Task<List<PeriodeValideeResponse>> GetPeriodesValideesAsync()
    {
        return await context.OrdresValidationEtatLoyer
            .OrderByDescending(o => o.Annee).ThenByDescending(o => o.Mois)
            .Select(o => new PeriodeValideeResponse
            {
                Annee = o.Annee,
                Mois = o.Mois,
                DateValidation = o.DateValidation
            })
            .ToListAsync();
    }

    // RMANew (ViewPageImpayesParAge.vb) : taux de provisionnement codés en dur dans la vue -
    // repris tels quels ici (0.25 sur les 3-6 mois, 0.5 sur les 6-12 mois + 100% au delà de
    // 12 mois), mais isolés en constantes nommées plutôt que dispersés dans du code d'affichage.
    private const decimal TauxProvisionDouteux = 0.25m;
    private const decimal TauxProvisionContentieux = 0.5m;

    public async Task<ImpayesParAgeResponse> GetImpayesParAgeAsync(int? noProprietaire)
    {
        DateTime today = DateTime.UtcNow.Date;

        IQueryable<Building> buildingsQuery = context.Buildings.Where(b => !b.Inactif);
        if (noProprietaire.HasValue)
        {
            buildingsQuery = buildingsQuery.Where(b => b.NoProprietaire == noProprietaire.Value);
        }

        List<Building> buildings = await buildingsQuery.ToListAsync();
        List<int> buildingIds = buildings.Select(b => b.Numero).ToList();

        // Pas de pré-filtre "impayésEncours" (champ dénormalisé absent du nouveau schéma) :
        // on prend tous les baux de l'immeuble, actifs ou non, et seul un impayé recalculé
        // > 0 décide de l'inclusion (voir plus bas), ce qui reproduit le même résultat.
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

        var response = new ImpayesParAgeResponse();

        foreach (Building building in buildings)
        {
            List<int> bailIdsBuilding = baux.Where(b => b.NoBuilding == building.Numero).Select(b => b.Numero).ToList();

            var buildingResponse = new ImpayesParAgeBuildingResponse
            {
                NoBuilding = building.Numero,
                Immeuble = building.Designation,
                CodeImmeuble = building.CodeImmeuble
            };

            foreach (int bailId in bailIdsBuilding)
            {
                List<Facture> facturesBail = facturesImpayees.Where(f => f.NoLocation == bailId).ToList();
                decimal impaye = facturesBail.Sum(f => Math.Max(0, f.Montant - soldeParFacture.GetValueOrDefault(f.Numero)));
                if (impaye <= 0)
                {
                    continue;
                }

                int nbMoisImpaye = facturesBail
                    .Where(f => f.Montant - soldeParFacture.GetValueOrDefault(f.Numero) > 0.01m)
                    .Select(f => new { f.Periode.Year, f.Periode.Month })
                    .Distinct()
                    .Count();

                if (nbMoisImpaye < 3)
                {
                    buildingResponse.MoinsDe3Mois += impaye;
                }
                else if (nbMoisImpaye < 6)
                {
                    buildingResponse.Entre3Et6Mois += impaye;
                }
                else if (nbMoisImpaye < 12)
                {
                    buildingResponse.Entre6MoisEt1An += impaye;
                }
                else
                {
                    buildingResponse.PlusDe12Mois += impaye;
                }
            }

            buildingResponse.Total = buildingResponse.MoinsDe3Mois + buildingResponse.Entre3Et6Mois +
                                      buildingResponse.Entre6MoisEt1An + buildingResponse.PlusDe12Mois;
            if (buildingResponse.Total <= 0)
            {
                continue;
            }

            buildingResponse.ProvisionDouteux = buildingResponse.Entre3Et6Mois * TauxProvisionDouteux;
            buildingResponse.ProvisionContentieux = buildingResponse.Entre6MoisEt1An * TauxProvisionContentieux +
                                                     buildingResponse.PlusDe12Mois;
            buildingResponse.TotalProvision = buildingResponse.ProvisionDouteux + buildingResponse.ProvisionContentieux;

            response.Buildings.Add(buildingResponse);
        }

        response.TotalMoinsDe3Mois = response.Buildings.Sum(b => b.MoinsDe3Mois);
        response.TotalEntre3Et6Mois = response.Buildings.Sum(b => b.Entre3Et6Mois);
        response.TotalEntre6MoisEt1An = response.Buildings.Sum(b => b.Entre6MoisEt1An);
        response.TotalPlusDe12Mois = response.Buildings.Sum(b => b.PlusDe12Mois);
        response.TotalGeneral = response.Buildings.Sum(b => b.Total);
        response.TotalProvisionDouteux = response.Buildings.Sum(b => b.ProvisionDouteux);
        response.TotalProvisionContentieux = response.Buildings.Sum(b => b.ProvisionContentieux);
        response.TotalProvision = response.Buildings.Sum(b => b.TotalProvision);

        return response;
    }

    // RMANew (ListImpayesLocataires.vb) : une ligne par bail (actif ou non - RMANew inclut
    // aussi ImpayesEncours=1, champ dénormalisé absent ici) dont l'impayé recalculé est > 0,
    // filtrable par Propriétaire et Encaisseur.
    public async Task<List<SuiviImpayeLigneResponse>> GetSuiviImpayeAsync(int? noProprietaire, int? noEncaisseur)
    {
        DateTime today = DateTime.UtcNow.Date;

        IQueryable<Bail> bauxQuery = context.Baux;
        if (noEncaisseur is > 0)
        {
            bauxQuery = bauxQuery.Where(b => b.NoEncaisseur == noEncaisseur);
        }

        List<Bail> baux = await bauxQuery.ToListAsync();

        var buildingIds = baux.Select(b => b.NoBuilding).Distinct().ToList();
        Dictionary<int, Building> buildings = await context.Buildings
            .Where(b => buildingIds.Contains(b.Numero))
            .ToDictionaryAsync(b => b.Numero);

        if (noProprietaire is > 0)
        {
            baux = baux.Where(b => buildings.TryGetValue(b.NoBuilding, out Building? bd) && bd.NoProprietaire == noProprietaire).ToList();
        }

        var bailIds = baux.Select(b => b.Numero).ToList();

        List<Facture> facturesImpayees = await context.Factures
            .Where(f => bailIds.Contains(f.NoLocation) && TypesLoyer.Contains(f.TypeFacture) &&
                        (f.Etat == EtatImpayee || f.Etat == EtatPartielle) && f.Periode <= today)
            .ToListAsync();
        var factureIds = facturesImpayees.Select(f => f.Numero).ToList();

        Dictionary<int, decimal> soldeParFacture = (await context.PaiementFactures
                .Where(pf => factureIds.Contains(pf.NoFacture))
                .ToListAsync())
            .GroupBy(pf => pf.NoFacture)
            .ToDictionary(g => g.Key, g => g.Sum(pf => pf.Montant));

        HashSet<int> bailsEnContentieux = (await context.SuivisContentieux
                .Where(s => s.NoLocation != null && bailIds.Contains(s.NoLocation.Value) && s.StatutDossier == "En Contentieux")
                .Select(s => s.NoLocation!.Value)
                .ToListAsync())
            .ToHashSet();

        var locataireIds = baux.Select(b => b.NoLocataire).Distinct().ToList();
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(l => locataireIds.Contains(l.Numero))
            .ToDictionaryAsync(l => l.Numero);

        var encaisseurIds = baux.Where(b => b.NoEncaisseur != null).Select(b => b.NoEncaisseur!.Value).Distinct().ToList();
        Dictionary<int, string> encaisseurs = await context.Encaisseurs
            .Where(e => encaisseurIds.Contains(e.Numero))
            .ToDictionaryAsync(e => e.Numero, e => e.Designation);

        var result = new List<SuiviImpayeLigneResponse>();
        foreach (Bail bail in baux)
        {
            List<Facture> facturesBail = facturesImpayees
                .Where(f => f.NoLocation == bail.Numero && f.Montant - soldeParFacture.GetValueOrDefault(f.Numero) > 0.01m)
                .ToList();

            decimal montantImpaye = facturesBail.Sum(f => Math.Max(0, f.Montant - soldeParFacture.GetValueOrDefault(f.Numero)));
            if (montantImpaye <= 0)
            {
                continue;
            }

            List<DateTime> periodes = facturesBail.Select(f => f.Periode).OrderBy(p => p).ToList();

            buildings.TryGetValue(bail.NoBuilding, out Building? building);
            locataires.TryGetValue(bail.NoLocataire, out Locataire? locataire);
            string? nomLocataire = locataire == null
                ? null
                : locataire.TypeLocataire == 1
                    ? locataire.DesignationEntreprise
                    : $"{locataire.Nom} {locataire.Prenom}".Trim();
            string? nomEncaisseur = bail.NoEncaisseur != null && encaisseurs.TryGetValue(bail.NoEncaisseur.Value, out string? enc) ? enc : null;

            result.Add(new SuiviImpayeLigneResponse
            {
                NoLocation = bail.Numero,
                NomLocataire = nomLocataire,
                NomBuilding = building?.Designation,
                LoyerMensuel = bail.Montant,
                PeriodeImpayesDebut = periodes.Count > 0 ? periodes[0] : null,
                PeriodeImpayesFin = periodes.Count > 0 ? periodes[^1] : null,
                NbMoisImpaye = periodes.Select(p => new { p.Year, p.Month }).Distinct().Count(),
                MontantImpaye = montantImpaye,
                Contentieux = bailsEnContentieux.Contains(bail.Numero),
                NomEncaisseur = nomEncaisseur
            });
        }

        return result.OrderBy(r => r.NomBuilding).ToList();
    }
}

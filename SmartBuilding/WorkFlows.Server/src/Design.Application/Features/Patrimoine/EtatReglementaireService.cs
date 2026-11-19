using Microsoft.EntityFrameworkCore;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Patrimoine;

// RMANew (ListEtatReglementaires.vb / ListEtatReglementairesD05.vb) : déclarations
// réglementaires ACAPS (assurance) recensant les actifs immobiliers en couverture des
// provisions techniques. D21 et D05 sont le même moteur (mêmes sections, mêmes colonnes
// de répartition par affectation) - D05 ajoute uniquement les revenus locatifs. Portés ici
// en un seul service partagé, comme recommandé après lecture du code legacy (les deux
// classes sources sont ~4000 lignes copiées-collées avec cette unique différence).
//
// Aucune des deux pages RMANew n'a de filtre année/actif/propriétaire (rapport figé sur
// tout le patrimoine actif) - repris à l'identique.
//
// Écart assumé avec le libellé legacy : RMANew nomme "Valeur d'inventaire" la colonne
// TableauAmortissement.TotalAmortiAlaFin brute (= l'amortissement cumulé lui-même) et
// "Amortissement/provision" la soustraction ValeurEntrée-ValeurInventaire - ce qui inverse
// les deux notions comptables usuelles (la VNC/valeur d'inventaire est normalement
// ValeurEntrée MOINS l'amortissement cumulé, pas l'amortissement cumulé lui-même). Comme
// pour le bug Taux/Durée de TypologieImmobilisation déjà corrigé ailleurs dans cette
// migration, on n'a pas reproduit l'inversion : ValeurInventaire = ValeurEntrée -
// AmortissementCumulé (VNC standard, cohérente avec le module Amortissements existant).
//
// La section "Autres actifs non amortissables / Parts et actions" de D21 (table manuelle
// EtatReglementaires, non portée dans ce schéma) n'est pas incluse - hors périmètre de ce
// bloc, à traiter séparément si nécessaire.
public class EtatReglementaireService(DbDesignContext context) : IEtatReglementaireService
{
    private static readonly string[] TypesLoyer = ["LoyerM", "Loyer"];
    private const string EtatAnnulee = "Annulée";

    private async Task<EtatReglementaireResponse> BuildAsync(string type, bool includeRevenusLocatifs)
    {
        List<Building> buildings = await context.Buildings.Where(b => !b.Inactif).ToListAsync();
        List<int> buildingIds = buildings.Select(b => b.Numero).ToList();

        List<TableauAmortissement> amortissements = await context.TableauxAmortissement
            .Where(a => buildingIds.Contains(a.NoBuilding) && !a.Inactif)
            .ToListAsync();

        Dictionary<int, List<Facture>>? facturesParBail = null;
        Dictionary<int, int>? buildingParBail = null;
        if (includeRevenusLocatifs)
        {
            List<Bail> baux = await context.Baux.Where(b => buildingIds.Contains(b.NoBuilding)).ToListAsync();
            buildingParBail = baux.ToDictionary(b => b.Numero, b => b.NoBuilding);
            List<int> bailIds = baux.Select(b => b.Numero).ToList();

            DateTime depuis = DateTime.UtcNow.AddMonths(-12);
            facturesParBail = (await context.Factures
                    .Where(f => bailIds.Contains(f.NoLocation) && TypesLoyer.Contains(f.TypeFacture) &&
                                f.Etat != EtatAnnulee && f.Periode >= depuis)
                    .ToListAsync())
                .GroupBy(f => f.NoLocation)
                .ToDictionary(g => g.Key, g => g.ToList());
        }

        var response = new EtatReglementaireResponse { Type = type };

        foreach (Building building in buildings)
        {
            List<TableauAmortissement> lignesAmorti = amortissements.Where(a => a.NoBuilding == building.Numero).ToList();
            if (lignesAmorti.Count == 0)
            {
                continue;
            }

            decimal valeurEntree = lignesAmorti.Sum(a => a.VaPrixAcquisition);
            decimal amortissementCumule = lignesAmorti.Sum(a => a.TotalAmortiAlaFin);
            decimal valeurInventaire = valeurEntree - amortissementCumule;

            var ligne = new EtatReglementaireLigneResponse
            {
                NoBuilding = building.Numero,
                CodeImmeuble = building.CodeImmeuble,
                TitreFoncier = building.TitreFoncier,
                Designation = building.Designation,
                ValeurEntree = valeurEntree,
                AmortissementCumule = amortissementCumule,
                ValeurInventaire = valeurInventaire,
                ValeurRealisation = building.ValeurRealisation,
                MoinsValueGlobale = 0
            };

            switch (building.NAffectation)
            {
                case "GV":
                    ligne.Vie = valeurInventaire;
                    break;
                case "GG":
                    ligne.NonVie = valeurInventaire;
                    break;
                case "GSR":
                    ligne.Gsr = valeurInventaire;
                    break;
                default:
                    ligne.Autres = valeurInventaire;
                    break;
            }

            if (includeRevenusLocatifs && buildingParBail != null && facturesParBail != null)
            {
                List<int> bailIdsBuilding = buildingParBail
                    .Where(kv => kv.Value == building.Numero)
                    .Select(kv => kv.Key)
                    .ToList();
                ligne.RevenusLocatifs = bailIdsBuilding
                    .Where(facturesParBail.ContainsKey)
                    .Sum(bailId => facturesParBail[bailId].Sum(f => f.Montant));
            }

            response.Lignes.Add(ligne);
        }

        response.TotalValeurEntree = response.Lignes.Sum(l => l.ValeurEntree);
        response.TotalAmortissementCumule = response.Lignes.Sum(l => l.AmortissementCumule);
        response.TotalValeurInventaire = response.Lignes.Sum(l => l.ValeurInventaire);
        response.TotalValeurRealisation = response.Lignes.Sum(l => l.ValeurRealisation ?? 0);
        response.TotalVie = response.Lignes.Sum(l => l.Vie);
        response.TotalNonVie = response.Lignes.Sum(l => l.NonVie);
        response.TotalGsr = response.Lignes.Sum(l => l.Gsr);
        response.TotalAutres = response.Lignes.Sum(l => l.Autres);
        if (includeRevenusLocatifs)
        {
            response.TotalRevenusLocatifs = response.Lignes.Sum(l => l.RevenusLocatifs ?? 0);
        }

        return response;
    }

    public Task<EtatReglementaireResponse> GetD21Async() => BuildAsync("D21", includeRevenusLocatifs: false);

    public Task<EtatReglementaireResponse> GetD05Async() => BuildAsync("D05", includeRevenusLocatifs: true);
}

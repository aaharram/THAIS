using Microsoft.EntityFrameworkCore;
using Design.Application.Interfaces.Leasing;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Configuration;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Leasing;

// RMANew (Classes/JournalSqComptable.vb, ~6000 lignes) : génère à la volée (rien n'est
// stocké) des lignes GL débit/crédit pour 5 familles d'écritures, à partir de
// FactureLoyer/LoyerAnnulations/Bordereau, avec des comptes codés en dur par
// TypeSéquenceComptable (ADMIS/LIBRE) - voir CompteComptableJournalConfiguration pour
// l'extraction en table éditable. Le legacy réutilisait la table de génération de
// quittances (OrdreGenerationQuittance/StatutSMS) comme piste d'audit d'export SmartStream -
// confusion de responsabilités remplacée ici par JournalComptableGeneration, dédiée.
//
// "Contentieux" n'existe pas comme flag sur Bail dans ce schéma - un bail est considéré en
// contentieux s'il a un dossier SuiviContentieux avec StatutDossier="En Contentieux",
// l'équivalent fonctionnel le plus proche déjà présent dans l'application.
//
// JournalProvisionLoyer.aspx (bloc précédent) n'a pas été porté séparément : ses deux
// exports ("Loyers Contentieux"/"Encaissement Contentieux") correspondent exactement aux
// types EmissionLoyersContentieux/EncaissementLoyersContentieux ci-dessous.
public class JournalComptableService(DbDesignContext context) : IJournalComptableService
{
    public const string TypeEmissionLoyers = "EmissionLoyers";
    public const string TypeAnnulationEmissionLoyers = "AnnulationEmissionLoyers";
    public const string TypeEmissionLoyersContentieux = "EmissionLoyersContentieux";
    public const string TypeEncaissementLoyers = "EncaissementLoyers";
    public const string TypeEncaissementLoyersContentieux = "EncaissementLoyersContentieux";

    private static readonly string[] TypesLoyer = ["LoyerM", "Loyer"];
    private const string EtatAnnulee = "Annulée";
    private const string StatutEnContentieux = "En Contentieux";

    private static DateTime EndOfMonth(DateTime d) => new DateTime(d.Year, d.Month, 1).AddMonths(1).AddDays(-1);

    public async Task<JournalComptableResponse> GetJournalAsync(int annee, int mois, int? noProprietaire, string typeJournal)
    {
        DateTime periodStart = new(annee, mois, 1);
        DateTime periodEnd = EndOfMonth(periodStart);

        IQueryable<Building> buildingsQuery = context.Buildings.Where(b => !b.Inactif);
        if (noProprietaire.HasValue)
        {
            buildingsQuery = buildingsQuery.Where(b => b.NoProprietaire == noProprietaire.Value);
        }

        List<Building> buildings = await buildingsQuery.ToListAsync();
        List<int> buildingIds = buildings.Select(b => b.Numero).ToList();
        Dictionary<int, Building> buildingsParId = buildings.ToDictionary(b => b.Numero);

        List<Bail> baux = await context.Baux.Where(b => buildingIds.Contains(b.NoBuilding)).ToListAsync();
        Dictionary<int, Bail> bauxParId = baux.ToDictionary(b => b.Numero);

        HashSet<int> bailsContentieux = (await context.SuivisContentieux
                .Where(s => s.NoLocation != null && s.StatutDossier == StatutEnContentieux)
                .Select(s => s.NoLocation!.Value)
                .ToListAsync())
            .ToHashSet();

        List<CompteComptableJournal> comptes = await context.ComptesComptableJournal
            .Where(c => c.TypeJournal == typeJournal)
            .ToListAsync();
        Dictionary<string, CompteComptableJournal> comptesParSequence = comptes
            .ToDictionary(c => c.TypeSequenceComptable, c => c);

        var response = new JournalComptableResponse { TypeJournal = typeJournal, Annee = annee, Mois = mois, NoProprietaire = noProprietaire };
        int lineNbr = 0;

        void AjouterLigne(Building building, DateTime effDate, decimal montant, string sens, string descp)
        {
            string typeSequence = building.TypeSequenceComptable ?? "ADMIS";
            if (!comptesParSequence.TryGetValue(typeSequence, out CompteComptableJournal? compte))
            {
                if (!response.ImmeublesSansCompte.Contains(building.Designation))
                {
                    response.ImmeublesSansCompte.Add(building.Designation);
                }

                return;
            }

            lineNbr++;
            response.Lignes.Add(new JournalComptableLigneResponse
            {
                JrnlLineNbr = lineNbr,
                EffDate = effDate,
                NoBuilding = building.Numero,
                Immeuble = building.Designation,
                Centre = building.CodeImmeuble,
                Catmin = building.NAffectation,
                Compte = sens == "D" ? compte.CompteDebit : compte.CompteCredit,
                SousCompte = compte.SousCompte,
                TransAmt = montant,
                SensDrCr = sens,
                Descp = descp
            });
        }

        bool ContentieuxVoulu() => typeJournal is TypeEmissionLoyersContentieux or TypeEncaissementLoyersContentieux;
        bool BailConcerne(int noLocation) => bailsContentieux.Contains(noLocation) == ContentieuxVoulu();

        switch (typeJournal)
        {
            case TypeEmissionLoyers:
            case TypeEmissionLoyersContentieux:
            {
                List<Facture> factures = await context.Factures
                    .Where(f => bauxParId.Keys.Contains(f.NoLocation) && TypesLoyer.Contains(f.TypeFacture) &&
                                f.Etat != EtatAnnulee && f.Periode >= periodStart && f.Periode <= periodEnd)
                    .ToListAsync();
                foreach (Facture facture in factures.Where(f => BailConcerne(f.NoLocation)))
                {
                    Building building = buildingsParId[bauxParId[facture.NoLocation].NoBuilding];
                    AjouterLigne(building, facture.DateEmission, facture.Montant, "D", $"Émission loyer {facture.Periode:MM/yyyy}");
                    AjouterLigne(building, facture.DateEmission, facture.Montant, "C", $"Émission loyer {facture.Periode:MM/yyyy}");
                }

                break;
            }
            case TypeAnnulationEmissionLoyers:
            {
                List<Facture> factures = await context.Factures
                    .Where(f => bauxParId.Keys.Contains(f.NoLocation) && TypesLoyer.Contains(f.TypeFacture) &&
                                f.Etat == EtatAnnulee && f.DateAnnulation >= periodStart && f.DateAnnulation <= periodEnd)
                    .ToListAsync();
                foreach (Facture facture in factures)
                {
                    Building building = buildingsParId[bauxParId[facture.NoLocation].NoBuilding];
                    AjouterLigne(building, facture.DateAnnulation!.Value, facture.Montant, "D", $"Annulation loyer {facture.Periode:MM/yyyy}");
                    AjouterLigne(building, facture.DateAnnulation!.Value, facture.Montant, "C", $"Annulation loyer {facture.Periode:MM/yyyy}");
                }

                break;
            }
            case TypeEncaissementLoyers:
            case TypeEncaissementLoyersContentieux:
            {
                List<Paiement> paiements = await context.Paiements
                    .Where(p => bauxParId.Keys.Contains(p.NoLocation) && !p.Annule &&
                                p.DatePaiement >= periodStart && p.DatePaiement <= periodEnd)
                    .ToListAsync();
                foreach (Paiement paiement in paiements.Where(p => BailConcerne(p.NoLocation)))
                {
                    Building building = buildingsParId[bauxParId[paiement.NoLocation].NoBuilding];
                    AjouterLigne(building, paiement.DatePaiement, paiement.Montant, "D", $"Encaissement loyer {paiement.DatePaiement:dd/MM/yyyy}");
                    AjouterLigne(building, paiement.DatePaiement, paiement.Montant, "C", $"Encaissement loyer {paiement.DatePaiement:dd/MM/yyyy}");
                }

                break;
            }
            default:
                throw new ArgumentException($"Type de journal inconnu : {typeJournal}");
        }

        response.TotalDebit = response.Lignes.Where(l => l.SensDrCr == "D").Sum(l => l.TransAmt);
        response.TotalCredit = response.Lignes.Where(l => l.SensDrCr == "C").Sum(l => l.TransAmt);
        return response;
    }

    public async Task<JournalComptableResponse> GenererAsync(GenererJournalComptableRequest request)
    {
        JournalComptableResponse journal = await GetJournalAsync(request.Annee, request.Mois, request.NoProprietaire, request.TypeJournal);

        var generation = new JournalComptableGeneration
        {
            Annee = request.Annee,
            Mois = request.Mois,
            NoProprietaire = request.NoProprietaire,
            TypeJournal = request.TypeJournal,
            DateGeneration = DateTime.UtcNow,
            GenerePar = request.GenerePar,
            NbLignes = journal.Lignes.Count,
            MontantTotal = journal.TotalDebit,
            AddUser = request.GenerePar,
            AddDate = DateTime.UtcNow,
            ModUser = request.GenerePar,
            ModDate = DateTime.UtcNow
        };

        context.JournalComptableGenerations.Add(generation);
        await context.SaveChangesAsync();

        return journal;
    }

    public async Task<List<JournalComptableGenerationResponse>> GetHistoriqueAsync()
    {
        List<JournalComptableGeneration> generations = await context.JournalComptableGenerations
            .OrderByDescending(g => g.DateGeneration)
            .ToListAsync();

        Dictionary<int, string> proprietaires = await context.Proprietaires
            .ToDictionaryAsync(p => p.Numero, p => p.Designation);

        return generations.Select(g => new JournalComptableGenerationResponse
        {
            Numero = g.Numero,
            Annee = g.Annee,
            Mois = g.Mois,
            NoProprietaire = g.NoProprietaire,
            Proprietaire = g.NoProprietaire.HasValue ? proprietaires.GetValueOrDefault(g.NoProprietaire.Value) : null,
            TypeJournal = g.TypeJournal,
            DateGeneration = g.DateGeneration,
            GenerePar = g.GenerePar,
            NbLignes = g.NbLignes,
            MontantTotal = g.MontantTotal
        }).ToList();
    }
}

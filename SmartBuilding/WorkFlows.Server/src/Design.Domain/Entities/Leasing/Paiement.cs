using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (ListPaiementClient.aspx / Classes/DataEntryPaiement.vb) : encaissement direct
// d'un loyer impayé auprès du locataire. Le legacy gère aussi remises bancaires, caution
// et arriérés dans la même classe (11000+ lignes) - ici on ne couvre que le paiement
// direct qui impute le montant sur les factures impayées du bail (les plus anciennes
// d'abord), voir PaiementService.CreateAsync.
public class Paiement : Base
{
    public int NoLocation { get; set; }
    public int? NoEncaisseur { get; set; }

    public decimal Montant { get; set; }
    public string ModePaiement { get; set; } = null!; // Espèce / Chèque / Effet / Virement bancaire
    public DateTime DatePaiement { get; set; }
    public string? Reference { get; set; } // n° chèque/effet

    public string? Notes { get; set; }

    // RMANew (Bordereau.DemandeAnnulation/IsAnnuler/Isrejet/DateAnnulation) : demande
    // d'annulation en attente ("Annulation Encaissement En cours"), résolue soit par
    // "Annuler" (Annule=1) soit par "Rejeter" (Rejete=1) - les DEUX imputent la même
    // restitution des factures (AnnulerEncaissement ET RejetEncaissement font exactement
    // la même chose côté factures dans le legacy), seul le libellé final diffère. Les deux
    // finissent dans "Encaissements annulés".
    public bool DemandeAnnulation { get; set; }
    public bool Annule { get; set; }
    public bool Rejete { get; set; }
    public DateTime? DateAnnulation { get; set; }

    // RMANew (Bordereau.NumRemiseBancaire) : simple étiquette texte posée en masse via
    // "Charger Remise bancaire" (import Excel à 2 colonnes RefPaiement/NumRemiseBancaire,
    // Classes/ListEncaissement.vb Importer()) - ce n'est pas une FK vers une table Remises
    // avec suivi de solde (mécanisme distinct du legacy, sur le formulaire d'édition d'un
    // encaissement, non repris ici).
    public string? NumRemiseBancaire { get; set; }

    // RMANew (Bordereau.isGenerated) : empêche de réinclure un encaissement déjà exporté
    // dans un "Rapport Comptable Encaissement" précédent (GenereEncaissement, marque
    // isGenerated=1 après export).
    public bool Genere { get; set; }
}

using System.ComponentModel.DataAnnotations.Schema;
using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (DataEntrySinistre.vb, table Sinistre) : NoImmeuble/NoLocal/NoAssurance/
// TypeSinistre obligatoires (Building et TypeSinistre bloquants à la sauvegarde).
// Indépendant de Bon de Commande/Prestations - ne dépend que de Building, Local
// (Patrimoine), Assurance et TypeSinistre (tous déjà migrés).
public class Sinistre : Base
{
    public int NoBuilding { get; set; }
    public int? NoLocal { get; set; }
    public int? NoAssurance { get; set; }
    public int NoTypeSinistre { get; set; }

    public string EtapeSuivi { get; set; } = "Déclaré"; // Déclaré / En expertise / Réglé / Clôturé
    public DateTime? DateDeclaration { get; set; }
    public DateTime? DateExpertise { get; set; }
    public DateTime? DateReclamation { get; set; }
    public DateTime? DateRemboursement { get; set; }

    public decimal? EstimationDegatBailleur { get; set; }
    public decimal? EstimationDegatLocataire { get; set; }
    public decimal? MontantFacture { get; set; }
    public decimal? MontantRemuneration { get; set; }

    public string? NomExpert { get; set; }
    public string? RefDossierAssurance { get; set; }
    public string? Notes { get; set; }

    public string? IdSinistre { get; set; } // auto "SIN{Numero}" après le premier save

    // Champs RMANew (DataEntrySinistre.aspx) absents jusqu'ici, ajoutés pour compléter
    // le formulaire selon la même règle métier. La table Sinistre en base a déjà été
    // étendue en amont (migration 20260902150143_AddSinistreCumulRefDagDevis, absente
    // de ce dépôt) : on réutilise ici les colonnes physiques existantes plutôt que d'en
    // créer des doublons - seuls NoSinistre et AgentAyantReclame sont réellement nouveaux.
    public string? NoSinistre { get; set; } // N°Sinistre saisi manuellement (distinct de IdSinistre, auto-généré) - NOUVELLE colonne

    // "Cumul en nombre des dossiers remis" : RMANew (ListSinistre.vb) lit Sinistre.Cumul (int),
    // pas CumulDossiersRemis (nvarchar) - une autre colonne préexistante, probablement un essai
    // antérieur resté orpheline. On suit ici le vrai code RMANew.
    public int? Cumul { get; set; }

    public string? AgentAyantReclame { get; set; } // NOUVELLE colonne
    public string? CompteurFicheIntervention { get; set; }
    public string? ReferenceDossierDAG { get; set; }

    [Column("DevisFacture")]
    public decimal? MontantExpert { get; set; } // "Montant de l'Expert" RMANew ↔ colonne existante DevisFacture

    public string? ReferenceFacture { get; set; }
    public string? ObjetReclamation { get; set; }
    public string? Site { get; set; }

    // Pièces jointes : références texte (même convention que SyndicReunion.PjConvocation/PjPV),
    // pas d'upload binaire dans ce projet pour l'instant.
    public string? CheminExpertiseLocataire { get; set; } // CR Expert Locataire
    public string? CheminExpertiseBailleur { get; set; } // CR Expert Bailleur
    public string? CheminPVExpertise { get; set; } // PV d'expertise
}

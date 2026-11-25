using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (ImportBonDeCommande.vb, table EleaseAchat) : le legacy n'a qu'un flux d'import
// Excel, pas de saisie unitaire - ici on garde la même table/les mêmes champs mais avec
// une saisie directe en plus de l'import. NoPrestataire → Fournisseur (= Prestataire
// déjà migré ici, la table legacy "Fournisseur" est le même concept).
public class BonDeCommande : Base
{
    public string NumeroBonCommande { get; set; } = null!; // IdAchat legacy, clé métier
    public int NoPrestataire { get; set; }

    public DateTime DateCommande { get; set; }
    public DateTime? DateReception { get; set; }
    public string? Compte { get; set; }
    public string? CompteComptable { get; set; }
    public string StatutApprobation { get; set; } = "En attente"; // En attente / Approuvé / Rejeté
    public string? Notes { get; set; }
}

using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (table OrdreValidationEtatsLoyers) : marque le verrouillage d'une période (une
// ligne = un mois/année validé). Sa seule existence détermine l'affichage "(Validé)" dans
// la liste des périodes et déclenche la bascule vers HistoriqueEtatdesloyers.aspx.
// Contrairement au legacy (pas de garde anti-doublon constatée), Annee+Mois est ici une
// clé unique (voir EtatLoyerConfiguration) pour empêcher une double validation de la même
// période.
public class OrdreValidationEtatLoyer : Base
{
    public int Annee { get; set; }
    public int Mois { get; set; }
    public DateTime DateValidation { get; set; }
    public int ValidePar { get; set; }
}

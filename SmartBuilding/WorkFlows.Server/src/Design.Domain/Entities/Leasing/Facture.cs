using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew : fusion de Classes/JournalLoyer.vb (moteur de génération, INSERT FactureLoyer +
// JournalLoyer) et Classes/ListFacture.vb (consultation/impression). Les deux tables
// legacy sont regroupées ici en un seul agrégat avec machine à états (Etat), au lieu de
// deux tables couplées par SQL brut liées par NoFactureLoyer.
public class Facture : Base
{
    public int NoLocation { get; set; }

    public DateTime Periode { get; set; } // mois/période facturée
    public DateTime DateEmission { get; set; }
    public DateTime? DateEcheance { get; set; }

    // Snapshot des composantes du loyer au moment de la génération (le loyer du bail
    // peut être révisé ensuite - une facture déjà émise ne doit pas changer avec lui).
    public decimal? LoyerNet { get; set; }
    public decimal? Charges { get; set; }
    public decimal? TVA { get; set; }
    public decimal? Taxe { get; set; }
    public decimal? Autres { get; set; }
    public decimal Montant { get; set; }

    // RMANew (FactureLoyer.TypeFacture) : Loyer/LoyerM (avis de loyer), Caution (reçu de
    // caution) ou Reliquat (solde impayé) - des documents différents, pas une variation
    // d'affichage du même document.
    public string TypeFacture { get; set; } = "LoyerM"; // LoyerM (généré) / Loyer (manuel) / Caution / Reliquat

    public string Etat { get; set; } = "Impayée"; // Impayée / Partiellement payée / Payée / Annulée
    public bool Edite { get; set; } // imprimée au moins une fois
    public bool DemandeAnnulation { get; set; }
    public DateTime? DateAnnulation { get; set; }

    public string? Notes { get; set; }
}

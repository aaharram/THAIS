using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (ListPrestations.vb / ImportPrestations.vb, table "AchatPresatation") : une
// ligne de prestation rattachée à un Bon de Commande (NoAchat → EleaseAchat) et à un
// Building. Dépend donc du bloc Bon de Commande, migré juste avant.
public class PrestationAchat : Base
{
    public int NoBonCommande { get; set; }
    public int NoBuilding { get; set; }
    public int NoTypologieCharge { get; set; } // nature de la prestation (NoPresatation legacy)

    public decimal PrixUnitaireHT { get; set; }
    public decimal Quantite { get; set; } = 1;
    public decimal? TauxTVA { get; set; }

    // Amortissement (RMANew : "Amortissement" disponible seulement si CompteComptable du
    // bon de commande commence par "2" et IsAmorti=0 ; calcul Montant/(Duree*12) ou
    // Montant*(Taux/100)/12).
    public int? DureeAmortissementMois { get; set; }
    public decimal? TauxAmortissement { get; set; }
    public bool EstAmorti { get; set; }

    public string? Notes { get; set; }
}

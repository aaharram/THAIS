using Design.Domain.Common;

namespace Design.Domain.Entities.Patrimoine;

// RMANew (CPCImmoblier / DataEntryCPCImmoblier.aspx) : Compte de Produits et Charges saisi
// manuellement, structure fixe à 7 rubriques × Vie/Non Vie (pas de lignes libres). Le
// legacy ne rattachait ce compte ni à un immeuble ni vraiment à une année (Initialize()
// écrasait toujours la clé par 1, ListAnnee() commenté) - lacune corrigée ici avec
// NoBuilding + Annee comme vraies clés de sélection, comme le reste du module Reporting.
public class CpcImmobilier : Base
{
    public int NoBuilding { get; set; }
    public int Annee { get; set; }

    public decimal RevenusImmobilierVie { get; set; }
    public decimal RevenusImmobilierNonVie { get; set; }
    public decimal PlusValuesImmobilieresVie { get; set; }
    public decimal PlusValuesImmobilieresNonVie { get; set; }
    public decimal ReprisesImmobilieresLoyersVie { get; set; }
    public decimal ReprisesImmobilieresLoyersNonVie { get; set; }
    public decimal ChargesImmobilieresVie { get; set; }
    public decimal ChargesImmobilieresNonVie { get; set; }
    public decimal MoinsValuesImmobilieresVie { get; set; }
    public decimal MoinsValuesImmobilieresNonVie { get; set; }
    public decimal DotationsImmobilieresVie { get; set; }
    public decimal DotationsImmobilieresNonVie { get; set; }
    public decimal ProvisionsImmobilieresVie { get; set; }
    public decimal ProvisionsImmobilieresNonVie { get; set; }

    public string? Notes { get; set; }
}

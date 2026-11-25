using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (Classes/DataEntryEleaseAvoir.vb) : une note de crédit qui réduit le solde
// d'une facture déjà émise. AfterSave y fait FactureLoyer.Montant -= Avoir.Montant,
// puis solde la facture (Etat=Payée) si le reste est <= 0.01 - reproduit dans
// AvoirService.CreateAsync.
public class Avoir : Base
{
    public int NoLocation { get; set; }
    public int NoFacture { get; set; }

    public DateTime DateAvoir { get; set; }
    public decimal Montant { get; set; }
    public string? Notes { get; set; }
}

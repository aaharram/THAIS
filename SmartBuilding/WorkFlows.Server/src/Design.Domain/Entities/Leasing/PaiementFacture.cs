using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (table Payement, une ligne par facture touchée par un Bordereau) : trace la
// répartition d'un Paiement sur les factures qu'il a soldées, pour pouvoir restituer
// exactement ces montants en cas d'annulation (PaiementService.ConfirmerAnnulationAsync).
public class PaiementFacture : Base
{
    public int NoPaiement { get; set; }
    public int NoFacture { get; set; }
    public decimal Montant { get; set; }
}

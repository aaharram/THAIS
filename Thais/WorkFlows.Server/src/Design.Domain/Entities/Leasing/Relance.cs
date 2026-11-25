using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (Classes/DataEntryRelanceLettre.vb / RelanceTele.vb / RelanceMiseEnDemeure.vb) :
// journal des actions de recouvrement amiable sur un bail en impayé (table "Relances",
// NoRecouvrementAmiab = NoLocation). Pas de montant ici - c'est un suivi d'actions,
// le solde impayé est calculé depuis les Factures liées au bail.
public class Relance : Base
{
    public int NoLocation { get; set; }

    // Lettre / Téléphonique / Mise en demeure - échelle d'escalade du recouvrement amiable.
    public string TypeRelance { get; set; } = "Lettre";
    public DateTime DateRelance { get; set; }
    public string TypeEnvoi { get; set; } = "Manuel";
    public string? Notes { get; set; }
}

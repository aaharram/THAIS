using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (ListRemise.aspx / Classes/ListRemise.vb, table Remises) : registre des remises
// bancaires. RMANew les peuple via GetRemises() - un appel à l'API bancaire réelle de RMA
// (clé et systemeSource en dur dans WebForm2.vb) - non repris ici : cette synchro tierce
// n'a pas sa place dans ce dépôt. Liste, filtres et actions de masse (Annuler/Supprimer)
// sont en revanche fidèles à ListRemise.vb.
public class Remise : Base
{
    public string? NumRemise { get; set; }
    public decimal Montant { get; set; }
    public decimal? MontantRestant { get; set; }

    // RMANew : 0 = Non consommé, 1 = Consommé.
    public int Statut { get; set; }

    public string? Reference { get; set; }
    public bool IsAnnuler { get; set; }
    public DateTime? DateAnnulation { get; set; }
}

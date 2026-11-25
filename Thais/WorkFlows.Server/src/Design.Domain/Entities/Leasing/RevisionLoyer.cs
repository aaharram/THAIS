using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// Historique des révisions de loyer d'un bail (RMANew: Classes/RevisionsLoyers.vb +
// DataEntryRévision.vb). Chaque ligne est une révision appliquée ; le loyer courant du
// bail (Bail.LoyerNet/Montant) reste la seule source de vérité pour le loyer en vigueur -
// contrairement à RMANew qui écrivait à la fois ici et sur Location.DateDernierRévision.
public class RevisionLoyer : Base
{
    public int NoLocation { get; set; }

    public decimal? AncienLoyer { get; set; }
    public decimal? NouveauLoyer { get; set; }
    public decimal? TauxRevision { get; set; }

    public DateTime DateRevision { get; set; }
    public DateTime? DateProchaineRevision { get; set; }
    public decimal? Reliquat { get; set; }

    public string? Notes { get; set; }
}

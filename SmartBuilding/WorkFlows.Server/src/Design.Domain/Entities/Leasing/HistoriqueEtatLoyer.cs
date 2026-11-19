using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (ViewPageEtatdesloyers.vb SaveEtatLoyers) : instantané ligne-par-ligne (un Bail =
// une ligne) de l'état des loyers au moment de la validation d'une période. Une fois
// validée, HistoriqueEtatdesloyers.aspx ne relit plus jamais Facture/Paiement en direct -
// seulement cette table, pour que les chiffres validés ne bougent plus si des paiements
// sont saisis/annulés après coup.
public class HistoriqueEtatLoyer : Base
{
    public int Annee { get; set; }
    public int Mois { get; set; }

    public int NoBuilding { get; set; }
    public string? Immeuble { get; set; }
    public string? CodeImmeuble { get; set; }
    public string? CompteGeneral { get; set; }

    public int NoLocation { get; set; }
    public string? NumContratLocations { get; set; }
    public string? Locataire { get; set; }

    // RMANew : Revenu = facturé sur la période, Encaissement = encaissé sur la période
    // (ces deux sommes ne portent pas forcément sur les mêmes factures), Enc = part de
    // l'encaissement effectivement imputée sur une facture de LA période, Autres =
    // Encaissement - Enc (encaissements de la période qui soldent une facture d'une
    // AUTRE période - arriérés réglés, avances, etc.).
    public decimal Revenu { get; set; }
    public decimal Encaissement { get; set; }
    public decimal Enc { get; set; }
    public decimal Autres { get; set; }

    public decimal Impaye { get; set; }
    public int NbMoisImpaye { get; set; }

    public DateTime? DateLimitePai { get; set; }
}

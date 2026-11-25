namespace Design.Contract.Responses;

// RMANew (ViewReporting.vb, ExportEtatRejet) : encaissements rejetés (Paiement.Rejete),
// export direct au clic (pas de page de consultation intermédiaire côté legacy).
public class EtatRejetResponse
{
    public int Numero { get; init; } // -> "ENC{Numero}" côté export, comme RMANew
    public DateTime DatePaiement { get; init; } // "Imputation"
    public decimal Montant { get; init; }
    public string? Reference { get; init; } // "N° réf paiement"
    public string? NomLocataire { get; init; }
    public string? NumContratLocations { get; init; } // "Compte"
    public string? CompteGeneral { get; init; } // "Sous compte"
    public string? CodeImmeuble { get; init; } // "VI"
    public string? NomEncaisseur { get; init; }
    public DateTime? DateRejet { get; init; } // DateAnnulation ?? null, comme RMANew
}

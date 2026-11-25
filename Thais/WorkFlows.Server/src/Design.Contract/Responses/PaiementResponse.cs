namespace Design.Contract.Responses;

public class PaiementResponse
{
    public int Numero { get; init; }
    public int NoLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string? NomLocataire { get; init; }
    public string? NomBuilding { get; init; }
    public string? NomEncaisseur { get; init; }

    public decimal Montant { get; init; }
    public string ModePaiement { get; init; } = null!;
    public DateTime DatePaiement { get; init; }
    public string? Reference { get; init; }
    public string? Notes { get; init; }

    public bool DemandeAnnulation { get; init; }
    public bool Annule { get; init; }
    public bool Rejete { get; init; }
    public DateTime? DateAnnulation { get; init; }

    public string? NumRemiseBancaire { get; init; }
    public bool Genere { get; init; }

    // RMANew (Bordereau.DebutPaiement/FinPaiement) : période couverte par les factures
    // soldées par cet encaissement, dérivée de PaiementFacture -> Facture.Periode.
    public DateTime? PeriodeDebut { get; init; }
    public DateTime? PeriodeFin { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
}

// Une ligne par bail avec un loyer impayé (Paiement Client — ListPaiementClient.aspx).
public class PaiementSummaryResponse
{
    public int NoLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string NomLocataire { get; init; } = null!;
    public string NomBuilding { get; init; } = null!;
    public int? NoProprietaire { get; init; }
    public int? NoEncaisseur { get; init; }
    public string? NomEncaisseur { get; init; }

    public decimal LoyerMensuel { get; init; }
    // RMANew (Location.NbMoisImpayes) : dénombré ici à partir des factures encore
    // impayées/partiellement payées du bail plutôt que depuis un compteur dénormalisé.
    public int NombreFacturesImpayees { get; init; }
    public decimal MontantImpaye { get; init; }
}

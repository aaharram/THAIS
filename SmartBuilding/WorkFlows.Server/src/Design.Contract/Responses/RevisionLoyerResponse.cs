namespace Design.Contract.Responses;

public class RevisionLoyerResponse
{
    public int Numero { get; init; }
    public int NoLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string? NomLocataire { get; init; }
    public string? NomBuilding { get; init; }
    public string? NomLocal { get; init; }

    public decimal? AncienLoyer { get; init; }
    public decimal? NouveauLoyer { get; init; }
    public decimal? TauxRevision { get; init; }
    public DateTime DateRevision { get; init; }
    public DateTime? DateProchaineRevision { get; init; }
    public decimal? Reliquat { get; init; }
    public string? Notes { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

// Une ligne par bail actif éligible à la révision, comme RMANew (RevisionsLoyers.aspx) :
// loyer courant, taux applicable, échéance et loyer projeté après révision.
public class RevisionLoyerSummaryResponse
{
    public int NoLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string NomLocataire { get; init; } = null!;
    public string NomBuilding { get; init; } = null!;
    public string? NomLocal { get; init; }
    public string? Usage { get; init; }

    public decimal LoyerActuel { get; init; }
    public decimal TauxApplicable { get; init; }
    public decimal LoyerApresRevision { get; init; }

    public DateTime? DateDerniereRevision { get; init; }
    public DateTime? DateProchaineRevision { get; init; }
    public bool EligibleRevision { get; init; }
    public int NombreRevisions { get; init; }
}

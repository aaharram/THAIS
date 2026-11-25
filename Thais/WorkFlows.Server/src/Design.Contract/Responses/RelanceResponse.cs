namespace Design.Contract.Responses;

public class RelanceResponse
{
    public int Numero { get; init; }
    public int NoLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string? NomLocataire { get; init; }
    public string? NomBuilding { get; init; }

    public string TypeRelance { get; init; } = null!;
    public DateTime DateRelance { get; init; }
    public string TypeEnvoi { get; init; } = null!;
    public string? Notes { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

// Une ligne par bail ayant un solde impayé (Suivi Recouvrement — ListSuiviRecouvrement.aspx).
public class RelanceSummaryResponse
{
    public int NoLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string NomLocataire { get; init; } = null!;
    public string NomBuilding { get; init; } = null!;
    public string? NomLocal { get; init; }
    public string? EtatBail { get; init; }

    public decimal SoldeImpaye { get; init; }
    public int NombreFacturesImpayees { get; init; }
    public string? DerniereRelanceType { get; init; }
    public DateTime? DerniereRelanceDate { get; init; }
    public int NombreRelances { get; init; }
}

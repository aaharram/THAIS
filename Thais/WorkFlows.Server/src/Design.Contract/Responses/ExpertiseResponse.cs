namespace Design.Contract.Responses;

public class ExpertiseResponse
{
    public int Numero { get; init; }

    public string CabinetExpert { get; init; } = null!;
    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int NoLocal { get; init; }
    public string? NomLocal { get; init; }

    public decimal? ValeurTerrain { get; init; }
    public decimal? ValeurConstruction { get; init; }
    public decimal? ValeurExpertiseActualiser { get; init; }
    public DateTime? DateExpertiseActualiser { get; init; }
    public string? PieceJointe { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

// Une ligne par couple (Actif, Local) : la dernière expertise + le nombre total de
// versions historiques, comme RMANew (ListExpertiseParTF).
public class ExpertiseSummaryResponse
{
    public int NoBuilding { get; init; }
    public string NomBuilding { get; init; } = null!;
    public int NoLocal { get; init; }
    public string? NomLocal { get; init; }
    public string? TitreFoncier { get; init; }
    public decimal? SurfaceUtile { get; init; }
    public decimal? ValeurEntree { get; init; }
    public decimal? DerniereExpertise { get; init; }
    public DateTime? DateDerniereExpertise { get; init; }
    public int DerniereExpertiseNumero { get; init; }
    public string? PieceJointe { get; init; }
    public int NombreVersions { get; init; }
}

namespace Design.Contract.Responses;

public class SuspensionResponse
{
    public int Numero { get; init; }

    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int NoContratLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string? NomLocataire { get; init; }

    public string? MotifSuspension { get; init; }
    public string StatutValidation { get; init; } = null!;

    public DateTime? DateSuspension { get; init; }
    public DateTime? DateArretSuspension { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

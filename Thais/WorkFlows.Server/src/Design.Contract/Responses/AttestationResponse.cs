namespace Design.Contract.Responses;

public class AttestationResponse
{
    public int Numero { get; init; }

    public int NoLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string? NomBuilding { get; init; }
    public int NoLocataire { get; init; }
    public string? NomLocataire { get; init; }

    public string TypeAttestation { get; init; } = null!;
    public DateTime? DateAttestation { get; init; }
    public DateTime? DateDebut { get; init; }
    public DateTime? DateFin { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

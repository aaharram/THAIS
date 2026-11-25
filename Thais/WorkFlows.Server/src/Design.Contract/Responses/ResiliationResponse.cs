namespace Design.Contract.Responses;

public class ResiliationResponse
{
    public int Numero { get; init; }

    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int NoContrat { get; init; }
    public string? NumContratLocations { get; init; }
    public string? NomLocataire { get; init; }
    public DateTime? DateDebutLocation { get; init; }
    public string? Etage { get; init; }
    public decimal? LoyerMensuel { get; init; }

    public string TypeResiliation { get; init; } = null!;
    public string? MotifResiliation { get; init; }
    public string? DurePreavis { get; init; }
    public string OrigineResiliation { get; init; } = null!;
    public string StatutValidation { get; init; } = null!;

    public DateTime? DateResiliation { get; init; }
    public DateTime? DateReception { get; init; }
    public DateTime? DateRestitutionActif { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

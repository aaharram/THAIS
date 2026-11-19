namespace Design.Contract.Responses;

public class AvoirResponse
{
    public int Numero { get; init; }
    public int NoLocation { get; init; }
    public int NoFacture { get; init; }
    public string? NumContratLocations { get; init; }
    public string? NomLocataire { get; init; }
    public string? NomBuilding { get; init; }
    public string? NomLocal { get; init; }

    public DateTime DateAvoir { get; init; }
    public decimal Montant { get; init; }
    public string? Notes { get; init; }

    public decimal MontantFactureAvant { get; init; }
    public decimal MontantFactureApres { get; init; }
    public string EtatFactureApres { get; init; } = null!;

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

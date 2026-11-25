namespace Design.Contract.Responses;

public class ProvisionResponse
{
    public int Numero { get; init; }

    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }

    public decimal? MontantProvision { get; init; }
    public DateTime? DateProvision { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

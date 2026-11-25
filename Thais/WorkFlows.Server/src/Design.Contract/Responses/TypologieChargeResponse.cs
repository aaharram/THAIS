namespace Design.Contract.Responses;

public class TypologieChargeResponse
{
    public int Numero { get; init; }
    public string Typologie { get; init; } = null!;
    public string? Compte { get; init; }
    public string? Description { get; init; }
    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

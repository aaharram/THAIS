namespace Design.Contract.Responses;

public class FilialeResponse
{
    public int Numero { get; init; }
    public string Nom { get; init; } = null!;
    public string? NumeroReference { get; init; }
    public DateTime? Date { get; init; }
    public string? Rib { get; init; }
    public int? NoBanque { get; init; }
    public string? NomBanque { get; init; }
    public string? ModeReglement { get; init; }
    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

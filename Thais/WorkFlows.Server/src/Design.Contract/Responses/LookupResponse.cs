namespace Design.Contract.Responses;

public class LookupResponse
{
    public int Numero { get; init; }
    public string Designation { get; init; } = null!;
    public decimal? Taux { get; init; }
    public bool? AccesComplet { get; init; }
    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

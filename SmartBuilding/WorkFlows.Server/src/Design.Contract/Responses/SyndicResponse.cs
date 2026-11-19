namespace Design.Contract.Responses;

public class SyndicResponse
{
    public int Numero { get; init; }
    public string Nom { get; init; } = null!;
    public string? Prenom { get; init; }
    public string? Poste { get; init; }
    public string? Telephone { get; init; }
    public DateTime? DebutMandat { get; init; }
    public DateTime? FinMandat { get; init; }
    public string? IdSyndic { get; init; }
    public string? Notes { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

namespace Design.Contract.Responses;

public class AvocatResponse
{
    public int Numero { get; init; }
    public int NoContentieux { get; init; }
    public string? Nom { get; init; }
    public string? Prenom { get; init; }
    public string? Cabinet { get; init; }
    public string? Contrat { get; init; }
    public string? PieceJointe { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
}

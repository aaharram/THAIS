namespace Design.Contract.Requests;

public class AvocatRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoContentieux { get; set; }
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Cabinet { get; set; }
    public string? Contrat { get; set; }
    public string? PieceJointe { get; set; }
}

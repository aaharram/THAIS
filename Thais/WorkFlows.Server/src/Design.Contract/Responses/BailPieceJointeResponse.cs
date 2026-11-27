namespace Design.Contract.Responses;

public class BailPieceJointeResponse
{
    public int Numero { get; init; }
    public int NoLocation { get; init; }
    public string FileName { get; init; } = null!;
    public string PieceJointe { get; init; } = null!;
    public long Taille { get; init; }
    public DateTime AddDate { get; init; }
}

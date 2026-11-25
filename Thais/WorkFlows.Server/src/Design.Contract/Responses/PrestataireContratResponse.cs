namespace Design.Contract.Responses;

public class PrestataireContratResponse
{
    public int Numero { get; init; }

    public int NoPrestataire { get; init; }
    public string? NomPrestataire { get; init; }
    public string? NumeroContrat { get; init; }
    public string? Objet { get; init; }
    public DateTime? DateContrat { get; init; }
    public DateTime? DateDebut { get; init; }
    public DateTime? DateFin { get; init; }
    public decimal? Montant { get; init; }
    public string? PieceJointe { get; init; }
    public string? Notes { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

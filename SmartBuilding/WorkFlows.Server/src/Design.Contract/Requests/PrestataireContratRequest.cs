namespace Design.Contract.Requests;

public class PrestataireContratRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoPrestataire { get; set; }
    public string? Objet { get; set; }
    public DateTime? DateContrat { get; set; }
    public DateTime? DateDebut { get; set; }
    public DateTime? DateFin { get; set; }
    public decimal? Montant { get; set; }
    public string? PieceJointe { get; set; }
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

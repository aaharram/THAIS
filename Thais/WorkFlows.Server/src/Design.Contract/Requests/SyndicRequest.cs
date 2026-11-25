namespace Design.Contract.Requests;

public class SyndicRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required string Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Poste { get; set; }
    public string? Telephone { get; set; }
    public DateTime? DebutMandat { get; set; }
    public DateTime? FinMandat { get; set; }
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

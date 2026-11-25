namespace Design.Contract.Requests;

public class FilialeRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }
    public required string Nom { get; set; }
    public string? NumeroReference { get; set; }
    public DateTime? Date { get; set; }
    public string? Rib { get; set; }
    public int? NoBanque { get; set; }
    public string? ModeReglement { get; set; }
}

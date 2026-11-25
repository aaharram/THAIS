namespace Design.Contract.Requests;

public class AgenceImmobiliereRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required string RaisonSocial { get; set; }
    public string? Adresse { get; set; }
    public string? Email { get; set; }
    public string? Tele { get; set; }
    public string? ContactPrincipal { get; set; }
    public string? TeleContactPrincipal { get; set; }

    public bool Inactif { get; set; }
}

namespace Design.Contract.Responses;

public class AgenceImmobiliereResponse
{
    public int Numero { get; init; }

    public string RaisonSocial { get; init; } = null!;
    public string? Adresse { get; init; }
    public string? Email { get; init; }
    public string? Tele { get; init; }
    public string? ContactPrincipal { get; init; }
    public string? TeleContactPrincipal { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

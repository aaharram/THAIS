using Design.Domain.Common;

namespace Design.Domain.Entities.Commercialisation;

public class AgenceImmobiliere : Base
{
    public string RaisonSocial { get; set; } = null!;
    public string? Adresse { get; set; }
    public string? Email { get; set; }
    public string? Tele { get; set; }
    public string? ContactPrincipal { get; set; }
    public string? TeleContactPrincipal { get; set; }

    public bool Inactif { get; set; }
}

using Design.Domain.Common;

namespace Design.Domain.Entities.Configuration;

public class Filiale : Base
{
    public string Nom { get; set; } = null!;
    public string? NumeroReference { get; set; }
    public DateTime? Date { get; set; }
    public string? Rib { get; set; }
    public int? NoBanque { get; set; }
    public string? ModeReglement { get; set; }
}

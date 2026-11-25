using Design.Domain.Common;

namespace Design.Domain.Entities.Configuration;

public class TypologieCharge : Base
{
    public string Typologie { get; set; } = null!;
    public string? Compte { get; set; }
    public string? Description { get; set; }
}

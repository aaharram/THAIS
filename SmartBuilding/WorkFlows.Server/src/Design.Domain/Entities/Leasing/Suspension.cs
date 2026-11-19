using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

public class Suspension : Base
{
    public int NoBuilding { get; set; }
    public int NoContratLocation { get; set; } // FK vers Bail (Location)

    public string? MotifSuspension { get; set; }
    public string StatutValidation { get; set; } = "Nouveau"; // Nouveau / En instance / Validée

    public DateTime? DateSuspension { get; set; }
    public DateTime? DateArretSuspension { get; set; } // date reprise

    public bool Inactif { get; set; }
}

using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

public class Resiliation : Base
{
    public int NoBuilding { get; set; }
    public int NoContrat { get; set; } // FK vers Bail (Location)

    public string TypeResiliation { get; set; } = "Amiable"; // Amiable / judicaire
    public string? MotifResiliation { get; set; }
    public string? DurePreavis { get; set; }
    public string OrigineResiliation { get; set; } = "Client"; // Client / RMA
    public string StatutValidation { get; set; } = "Nouveau"; // Nouveau / En instance / Validée

    public DateTime? DateResiliation { get; set; } // date effet résiliation
    public DateTime? DateReception { get; set; } // date de réception de la demande
    public DateTime? DateRestitutionActif { get; set; }

    public bool Inactif { get; set; }
}

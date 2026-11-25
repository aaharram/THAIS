using Design.Domain.Common;

namespace Design.Domain.Entities.Patrimoine;

public class Expertise : Base
{
    public string CabinetExpert { get; set; } = null!;
    public int NoBuilding { get; set; }
    public int NoLocal { get; set; }

    public decimal? ValeurTerrain { get; set; }
    public decimal? ValeurConstruction { get; set; }
    public decimal? ValeurExpertiseActualiser { get; set; } // Nouvelle Expt
    public DateTime? DateExpertiseActualiser { get; set; } // Date Nouvelle Expt
    public string? PieceJointe { get; set; }
}

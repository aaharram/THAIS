namespace Design.Contract.Requests;

public class SuspensionRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public required int NoContratLocation { get; set; }

    public string? MotifSuspension { get; set; }
    public string StatutValidation { get; set; } = "Nouveau";

    public DateTime? DateSuspension { get; set; }
    public DateTime? DateArretSuspension { get; set; }

    public bool Inactif { get; set; }
}

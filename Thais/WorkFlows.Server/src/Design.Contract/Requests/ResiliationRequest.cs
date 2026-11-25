namespace Design.Contract.Requests;

public class ResiliationRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public required int NoContrat { get; set; }

    public string TypeResiliation { get; set; } = "Amiable";
    public string? MotifResiliation { get; set; }
    public string? DurePreavis { get; set; }
    public string OrigineResiliation { get; set; } = "Client";
    public string StatutValidation { get; set; } = "Nouveau";

    public DateTime? DateResiliation { get; set; }
    public DateTime? DateReception { get; set; }
    public DateTime? DateRestitutionActif { get; set; }

    public bool Inactif { get; set; }
}

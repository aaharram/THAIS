namespace Design.Contract.Requests;

public class ProspectionRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public string? Description { get; set; }
    public int? Typologie { get; set; }
    public int? TypeOperation { get; set; }
    public int? SituationProspection { get; set; }

    public DateTime? DateAjout { get; set; }
    public DateTime? DateAdjudication { get; set; }
    public DateTime? DateContrat { get; set; }

    public string? Notes { get; set; }

    public string? Pv { get; set; }
    public string? AvisBPP { get; set; }
    public string? AvisDPAL { get; set; }
    public string? SupportCA { get; set; }
    public string? BusinesPlan { get; set; }

    public bool Inactif { get; set; }
}

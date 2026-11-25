namespace Design.Contract.Responses;

public class ProspectionResponse
{
    public int Numero { get; init; }

    public string? Description { get; init; }
    public int? Typologie { get; init; }
    public int? TypeOperation { get; init; }
    public int? SituationProspection { get; init; }
    public int NbBien { get; init; }

    public DateTime? DateAjout { get; init; }
    public DateTime? DateAdjudication { get; init; }
    public DateTime? DateContrat { get; init; }

    public string? Notes { get; init; }

    public string? Pv { get; init; }
    public string? AvisBPP { get; init; }
    public string? AvisDPAL { get; init; }
    public string? SupportCA { get; init; }
    public string? BusinesPlan { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

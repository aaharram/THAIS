namespace Design.Contract.Requests;

public class SyndicReunionRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public string? Type { get; set; }
    public DateTime? DateReunion { get; set; }
    public bool Reglee { get; set; }
    public DateTime? DateReglement { get; set; }
    public int? NoVille { get; set; }
    public int? NombreQuotePart { get; set; }
    public decimal? QuotePartAppelFonds { get; set; }
    public decimal? AppelFondsAnnuel { get; set; }
    public string? PjConvocation { get; set; }
    public string? PjPV { get; set; }
    public string? PjAppelFonds { get; set; }
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

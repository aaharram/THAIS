namespace Design.Contract.Responses;

public class SyndicReunionResponse
{
    public int Numero { get; init; }

    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public string? Type { get; init; }
    public DateTime? DateReunion { get; init; }
    public bool Reglee { get; init; }
    public DateTime? DateReglement { get; init; }
    public int? NoVille { get; init; }
    public string? NomVille { get; init; }
    public int? NombreQuotePart { get; init; }
    public decimal? QuotePartAppelFonds { get; init; }
    public decimal? AppelFondsAnnuel { get; init; }
    public string? PjConvocation { get; init; }
    public string? PjPV { get; init; }
    public string? PjAppelFonds { get; init; }
    public string? Notes { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

namespace Design.Contract.Requests;

public class SuiviContentieuxRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public int? NoLocation { get; set; }
    public string? NatureProcedure { get; set; }
    public string? Observation { get; set; }
    public string? Description { get; set; }
    public string? StatutDossier { get; set; }
    public DateTime? DateDebutContentieux { get; set; }
    public DateTime? DateEncaissement { get; set; }
    public decimal? MontantEncaisse { get; set; }
    public decimal? SoldeAnneePrecedente { get; set; }
    public string? PieceJointe { get; set; }
}

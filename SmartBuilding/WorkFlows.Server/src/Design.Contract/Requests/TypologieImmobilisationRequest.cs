namespace Design.Contract.Requests;

public class TypologieImmobilisationRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }
    public required string ImmobilisationConcernee { get; set; }
    public string? CompteComptable { get; set; }
    public string? CompteAmortissement { get; set; }
    public string? CompteDotation { get; set; }
    public decimal? Taux { get; set; }
    public int? Duree { get; set; }
}

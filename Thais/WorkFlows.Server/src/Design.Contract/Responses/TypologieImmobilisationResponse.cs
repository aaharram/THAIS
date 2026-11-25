namespace Design.Contract.Responses;

public class TypologieImmobilisationResponse
{
    public int Numero { get; init; }
    public string ImmobilisationConcernee { get; init; } = null!;
    public string? CompteComptable { get; init; }
    public string? CompteAmortissement { get; init; }
    public string? CompteDotation { get; init; }
    public decimal? Taux { get; init; }
    public int? Duree { get; init; }
    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

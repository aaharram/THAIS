namespace Design.Contract.Requests;

public class ContentieuxHorsLocationRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public string? Locataire { get; set; }
    public string? CodeLocataire { get; set; }
    public string? Immeuble { get; set; }
    public decimal? LoyerMensuelTTC { get; set; }
    public required DateTime DateDebutImpaye { get; set; }
    public required DateTime DateFinImpaye { get; set; }
    public decimal? MontantLoyerImpaye { get; set; }
    public int Type { get; set; }
}

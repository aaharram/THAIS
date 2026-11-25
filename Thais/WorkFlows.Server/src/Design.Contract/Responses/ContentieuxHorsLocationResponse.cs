namespace Design.Contract.Responses;

public class ContentieuxHorsLocationResponse
{
    public int Numero { get; init; }

    public string? Locataire { get; init; }
    public string? CodeLocataire { get; init; }
    public string? Immeuble { get; init; }
    public decimal? LoyerMensuelTTC { get; init; }
    public DateTime DateDebutImpaye { get; init; }
    public DateTime DateFinImpaye { get; init; }
    public decimal? MontantLoyerImpaye { get; init; }
    public int Type { get; init; }

    // RMANew (ListContentieuxHorsLocation.vb PostProcess, "NBMoisImpay") :
    // fin.Month - debut.Month + (fin.Year - debut.Year) * 12 + 1
    public int NbMoisImpaye { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

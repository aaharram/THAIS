namespace Design.Contract.Responses;

public class TaxeResponse
{
    public int Numero { get; init; }
    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int? NoLocal { get; init; }
    public string? NomLocal { get; init; }
    public int? NoLocataire { get; init; }
    public string? NomLocataire { get; init; }
    public int NoType { get; init; }
    public string? NomType { get; init; }

    public string? IdFiscal { get; init; }
    public string? NoArticle { get; init; }
    public decimal? MontantTaxe { get; init; }
    public int Annee { get; init; }
    public bool Paye { get; init; }
    public string? Notes { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

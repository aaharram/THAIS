namespace Design.Contract.Requests;

public class TaxeRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public int? NoLocal { get; set; }
    public int? NoLocataire { get; set; }
    public required int NoType { get; set; }

    public string? IdFiscal { get; set; }
    public string? NoArticle { get; set; }
    public decimal? MontantTaxe { get; set; }
    public required int Annee { get; set; }
    public bool Paye { get; set; }
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

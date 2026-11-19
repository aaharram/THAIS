namespace Design.Contract.Responses;

public class CpcImmobilierResponse
{
    public int Numero { get; set; }

    public int NoBuilding { get; set; }
    public string? NomBuilding { get; set; }
    public int Annee { get; set; }

    public decimal RevenusImmobilierVie { get; set; }
    public decimal RevenusImmobilierNonVie { get; set; }
    public decimal PlusValuesImmobilieresVie { get; set; }
    public decimal PlusValuesImmobilieresNonVie { get; set; }
    public decimal ReprisesImmobilieresLoyersVie { get; set; }
    public decimal ReprisesImmobilieresLoyersNonVie { get; set; }
    public decimal ChargesImmobilieresVie { get; set; }
    public decimal ChargesImmobilieresNonVie { get; set; }
    public decimal MoinsValuesImmobilieresVie { get; set; }
    public decimal MoinsValuesImmobilieresNonVie { get; set; }
    public decimal DotationsImmobilieresVie { get; set; }
    public decimal DotationsImmobilieresNonVie { get; set; }
    public decimal ProvisionsImmobilieresVie { get; set; }
    public decimal ProvisionsImmobilieresNonVie { get; set; }

    // Totaux (Produits - Charges), calculés, pas stockés.
    public decimal ResultatVie { get; set; }
    public decimal ResultatNonVie { get; set; }

    public string? Notes { get; set; }

    public int? AddUser { get; set; }
    public DateTime AddDate { get; set; }
    public int? ModUser { get; set; }
    public DateTime ModDate { get; set; }
}

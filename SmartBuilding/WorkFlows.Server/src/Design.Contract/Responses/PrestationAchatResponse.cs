namespace Design.Contract.Responses;

public class PrestationAchatResponse
{
    public int Numero { get; init; }
    public int NoBonCommande { get; init; }
    public string? NumeroBonCommande { get; init; }
    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int NoTypologieCharge { get; init; }
    public string? NomTypologieCharge { get; init; }

    public decimal PrixUnitaireHT { get; init; }
    public decimal Quantite { get; init; }
    public decimal? TauxTVA { get; init; }
    public decimal MontantTTC { get; init; } // calculé : PU*Qte + TVA

    public int? DureeAmortissementMois { get; init; }
    public decimal? TauxAmortissement { get; init; }
    public bool EstAmorti { get; init; }
    public bool EligibleAmortissement { get; init; } // CompteComptable du BC commence par "2"
    public string? Notes { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

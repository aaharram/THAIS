namespace Design.Contract.Requests;

public class PrestationAchatRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBonCommande { get; set; }
    public required int NoBuilding { get; set; }
    public required int NoTypologieCharge { get; set; }

    public required decimal PrixUnitaireHT { get; set; }
    public decimal? Quantite { get; set; }
    public decimal? TauxTVA { get; set; }
    public string? Notes { get; set; }
}

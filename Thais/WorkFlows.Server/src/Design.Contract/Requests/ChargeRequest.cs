namespace Design.Contract.Requests;

public class ChargeRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public required int NoTypologieCharge { get; set; }
    public int? NoPrestataire { get; set; }

    public required int Annee { get; set; }
    public decimal? Montant { get; set; }
    public decimal? Realisation { get; set; }
    public DateTime? DateDecaissement { get; set; }
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

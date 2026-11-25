namespace Design.Contract.Requests;

public class PaiementRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoLocation { get; set; }
    public int? NoEncaisseur { get; set; }

    public required decimal Montant { get; set; }
    public required string ModePaiement { get; set; }
    public DateTime? DatePaiement { get; set; }
    public string? Reference { get; set; }
    public string? Notes { get; set; }
}

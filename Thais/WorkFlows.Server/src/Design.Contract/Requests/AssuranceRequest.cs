namespace Design.Contract.Requests;

public class AssuranceRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public string? NumPolice { get; set; }
    public required int NoAssureur { get; set; }
    public int? NoCourtier { get; set; }
    public string? TypeCouverture { get; set; }
    public DateTime? DateEffetContrat { get; set; }
    public decimal? Montant { get; set; }
    public string Statut { get; set; } = "EnCours";
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

namespace Design.Contract.Requests;

public class BonDeCommandeRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required string NumeroBonCommande { get; set; }
    public required int NoPrestataire { get; set; }

    public required DateTime DateCommande { get; set; }
    public DateTime? DateReception { get; set; }
    public string? Compte { get; set; }
    public string? CompteComptable { get; set; }
    public string? StatutApprobation { get; set; }
    public string? Notes { get; set; }
}

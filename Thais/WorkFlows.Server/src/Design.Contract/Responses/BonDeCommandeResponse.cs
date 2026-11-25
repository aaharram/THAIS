namespace Design.Contract.Responses;

public class BonDeCommandeResponse
{
    public int Numero { get; init; }
    public string NumeroBonCommande { get; init; } = null!;
    public int NoPrestataire { get; init; }
    public string? NomPrestataire { get; init; }

    public DateTime DateCommande { get; init; }
    public DateTime? DateReception { get; init; }
    public string? Compte { get; init; }
    public string? CompteComptable { get; init; }
    public string StatutApprobation { get; init; } = null!;
    public string? Notes { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

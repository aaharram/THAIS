namespace Design.Contract.Responses;

public class AssuranceResponse
{
    public int Numero { get; init; }

    public string? NumPolice { get; init; }
    public int NoAssureur { get; init; }
    public string? NomAssureur { get; init; }
    public int? NoCourtier { get; init; }
    public string? NomCourtier { get; init; }
    public string? TypeCouverture { get; init; }
    public DateTime? DateEffetContrat { get; init; }
    public decimal? Montant { get; init; }
    public string Statut { get; init; } = null!;
    public string? Notes { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

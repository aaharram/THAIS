namespace Design.Contract.Responses;

public class ChargeResponse
{
    public int Numero { get; init; }
    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int NoTypologieCharge { get; init; }
    public string? NomTypologieCharge { get; init; }
    public int? NoPrestataire { get; init; }
    public string? NomPrestataire { get; init; }

    public int Annee { get; init; }
    public decimal? Montant { get; init; }
    public decimal? Realisation { get; init; }
    public decimal? Ecart { get; init; } // Realisation - Montant, calculé
    public DateTime? DateDecaissement { get; init; }
    public string? CodeCharge { get; init; }
    public string? Notes { get; init; }

    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

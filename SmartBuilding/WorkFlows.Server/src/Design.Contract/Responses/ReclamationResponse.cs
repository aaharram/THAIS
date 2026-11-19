namespace Design.Contract.Responses;

public class ReclamationResponse
{
    public int Numero { get; init; }
    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int? NoLocal { get; init; }
    public string? NomLocal { get; init; }
    public int NoLocataire { get; init; }
    public string? NomLocataire { get; init; }

    public string Etat { get; init; } = null!;
    public DateTime? DateReclamation { get; init; }
    public string? Objet { get; init; }
    public string? Notes { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

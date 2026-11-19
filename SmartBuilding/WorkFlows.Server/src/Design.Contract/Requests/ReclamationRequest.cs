namespace Design.Contract.Requests;

public class ReclamationRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public int? NoLocal { get; set; }
    public required int NoLocataire { get; set; }

    public string? Etat { get; set; }
    public DateTime? DateReclamation { get; set; }
    public string? Objet { get; set; }
    public string? Notes { get; set; }
}

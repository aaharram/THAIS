namespace Design.Contract.Requests;

public class TableauAmortissementRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public required int ImmobConcernees { get; set; }

    public DateTime? DateEntree { get; set; }
    public required decimal VaPrixAcquisition { get; set; }

    public decimal? ValeurTerrain { get; set; }
    public decimal? ValeurConstruction { get; set; }
    public decimal? ValeurAmenagement { get; set; }

    public bool ImmobPrincipal { get; set; }
    public bool Inactif { get; set; }
}

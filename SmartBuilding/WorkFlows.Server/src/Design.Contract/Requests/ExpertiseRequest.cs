namespace Design.Contract.Requests;

public class ExpertiseRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required string CabinetExpert { get; set; }
    public required int NoBuilding { get; set; }
    public required int NoLocal { get; set; }

    public decimal? ValeurTerrain { get; set; }
    public decimal? ValeurConstruction { get; set; }
    public decimal? ValeurExpertiseActualiser { get; set; }
    public DateTime? DateExpertiseActualiser { get; set; }
    public string? PieceJointe { get; set; }
}

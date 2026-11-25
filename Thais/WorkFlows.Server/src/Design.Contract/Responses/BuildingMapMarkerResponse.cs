namespace Design.Contract.Responses;

// RMANew (Classes/Carte.vb, GetImmeubles) : version allégée de BuildingResponse, juste
// les champs nécessaires à un marqueur de la carte Géolocalisation (pas les ~60 champs
// de la fiche complète).
public class BuildingMapMarkerResponse
{
    public int Numero { get; init; }
    public string Designation { get; init; } = null!;
    public string? Address1 { get; init; }
    public string? NomBuildingType { get; init; }
    public string? NomCity { get; init; }
    public decimal Latitude { get; init; }
    public decimal Longitude { get; init; }
}

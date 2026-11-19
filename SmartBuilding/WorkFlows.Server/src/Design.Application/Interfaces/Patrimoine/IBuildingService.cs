using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Patrimoine;

public interface IBuildingService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<PagedResult<object>> GetArchivedAsync(GetFilterSearchSortRequest request);
    Task<List<BuildingMapMarkerResponse>> GetMapMarkersAsync(int? noProprietaire, int? noBuildingType);
    Task<BuildingResponse> GetByIdAsync(int id);
    Task<BuildingResponse> CreateAsync(BuildingRequest request);
    Task<BuildingResponse> UpdateAsync(int id, BuildingRequest request);
    Task<int> DeleteAsync(int id);
    Task<BuildingResponse> ReactivateAsync(int id);

    // Fiche d'un actif (DataEntryBuilding) : documents libres et immobilisations en cours.
    Task<List<BuildingPieceJointeResponse>> GetPiecesJointesAsync(int buildingId);
    Task<BuildingPieceJointeResponse> AddPieceJointeAsync(int buildingId, BuildingPieceJointeRequest request);
    Task<int> DeletePieceJointeAsync(int buildingId, int pieceJointeId);
    Task<List<ImmobilisationEnCoursResponse>> GetImmobilisationsEnCoursAsync(int buildingId);
}

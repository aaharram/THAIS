using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IBailService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<PagedResult<object>> GetArchivedAsync(GetFilterSearchSortRequest request);
    Task<BailResponse> GetByIdAsync(int id);
    Task<BailResponse> CreateAsync(BailRequest request);
    Task<BailResponse> UpdateAsync(int id, BailRequest request);
    Task<int> DeleteAsync(int id);
    Task<BailResponse> ReactivateAsync(int id);
    Task<List<NouveauBailResponse>> GetNouveauxAsync(int? noProprietaire);
    Task<BailImportResponse> ImportAsync(BailImportRequest request);
    Task<List<BailPieceJointeResponse>> GetPiecesJointesAsync(int bailId);
    Task<BailPieceJointeResponse> AddPieceJointeAsync(int bailId, BailPieceJointeRequest request);
    Task<int> DeletePieceJointeAsync(int bailId, int pieceJointeId);
}

using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface IBonDeCommandeService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<BonDeCommandeResponse> GetByIdAsync(int id);
    Task<BonDeCommandeResponse> CreateAsync(BonDeCommandeRequest request);
    Task<BonDeCommandeResponse> UpdateAsync(int id, BonDeCommandeRequest request);
    Task<int> DeleteAsync(int id);
    Task<BonDeCommandeImportResult> ImportAsync(BonDeCommandeImportRequest request);
}

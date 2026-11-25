using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IRevisionLoyerService
{
    Task<PagedResult<object>> GetSummaryAsync(GetFilterSearchSortRequest request);
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<RevisionLoyerResponse> GetByIdAsync(int id);
    Task<RevisionLoyerResponse> CreateAsync(RevisionLoyerRequest request);
    Task<RevisionLoyerResponse> UpdateAsync(int id, RevisionLoyerRequest request);
    Task<int> DeleteAsync(int id);
}

using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IResiliationService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<ResiliationResponse> GetByIdAsync(int id);
    Task<ResiliationResponse> CreateAsync(ResiliationRequest request);
    Task<ResiliationResponse> UpdateAsync(int id, ResiliationRequest request);
    Task<int> DeleteAsync(int id);
}

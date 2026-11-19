using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface ISuspensionService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<SuspensionResponse> GetByIdAsync(int id);
    Task<SuspensionResponse> CreateAsync(SuspensionRequest request);
    Task<SuspensionResponse> UpdateAsync(int id, SuspensionRequest request);
    Task<int> DeleteAsync(int id);
}

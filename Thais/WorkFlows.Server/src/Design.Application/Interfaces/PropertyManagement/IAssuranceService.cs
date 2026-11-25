using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface IAssuranceService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<AssuranceResponse> GetByIdAsync(int id);
    Task<AssuranceResponse> CreateAsync(AssuranceRequest request);
    Task<AssuranceResponse> UpdateAsync(int id, AssuranceRequest request);
    Task<int> DeleteAsync(int id);
}

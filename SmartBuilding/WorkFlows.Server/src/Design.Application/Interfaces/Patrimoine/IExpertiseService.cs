using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Patrimoine;

public interface IExpertiseService
{
    Task<PagedResult<object>> GetSummaryAsync(GetFilterSearchSortRequest request);
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<ExpertiseResponse> GetByIdAsync(int id);
    Task<ExpertiseResponse> CreateAsync(ExpertiseRequest request);
    Task<ExpertiseResponse> UpdateAsync(int id, ExpertiseRequest request);
    Task<int> DeleteAsync(int id);
}

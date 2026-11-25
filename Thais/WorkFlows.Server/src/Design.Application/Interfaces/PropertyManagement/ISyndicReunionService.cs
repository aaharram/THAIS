using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface ISyndicReunionService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<PagedResult<object>> GetSummaryByBuildingAsync(GetFilterSearchSortRequest request);
    Task<SyndicReunionResponse> GetByIdAsync(int id);
    Task<SyndicReunionResponse> CreateAsync(SyndicReunionRequest request);
    Task<SyndicReunionResponse> UpdateAsync(int id, SyndicReunionRequest request);
    Task<int> DeleteAsync(int id);
}

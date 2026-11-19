using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IRelanceService
{
    Task<PagedResult<object>> GetSummaryAsync(GetFilterSearchSortRequest request);
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<RelanceResponse> CreateAsync(RelanceRequest request);
}

using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IAvoirService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<AvoirResponse> GetByIdAsync(int id);
    Task<AvoirResponse> CreateAsync(AvoirRequest request);
}

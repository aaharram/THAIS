using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IContentieuxHorsLocationService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<ContentieuxHorsLocationResponse> GetByIdAsync(int id);
    Task<ContentieuxHorsLocationResponse> CreateAsync(ContentieuxHorsLocationRequest request);
    Task<ContentieuxHorsLocationResponse> UpdateAsync(int id, ContentieuxHorsLocationRequest request);
    Task<int> DeleteAsync(int id);
}

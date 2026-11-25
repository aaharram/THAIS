using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface ISyndicService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<SyndicResponse> GetByIdAsync(int id);
    Task<SyndicResponse> CreateAsync(SyndicRequest request);
    Task<SyndicResponse> UpdateAsync(int id, SyndicRequest request);
    Task<int> DeleteAsync(int id);
}

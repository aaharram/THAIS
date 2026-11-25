using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Patrimoine;

public interface IVncService
{
    Task<PagedResult<object>> GetSummaryAsync(GetFilterSearchSortRequest request);
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<VncResponse> GetByIdAsync(int id);
    Task<VncResponse> CreateAsync(VncRequest request);
    Task<VncResponse> UpdateAsync(int id, VncRequest request);
    Task<int> DeleteAsync(int id);
}

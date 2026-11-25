using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface IChargeService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<ChargeResponse> GetByIdAsync(int id);
    Task<ChargeResponse> CreateAsync(ChargeRequest request);
    Task<ChargeResponse> UpdateAsync(int id, ChargeRequest request);
    Task<int> DeleteAsync(int id);
}

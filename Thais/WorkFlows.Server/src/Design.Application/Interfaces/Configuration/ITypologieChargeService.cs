using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Configuration;

public interface ITypologieChargeService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<TypologieChargeResponse> GetByIdAsync(int id);
    Task<TypologieChargeResponse> CreateAsync(TypologieChargeRequest request);
    Task<TypologieChargeResponse> UpdateAsync(int id, TypologieChargeRequest request);
    Task<int> DeleteAsync(int id);
}

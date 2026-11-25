using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Patrimoine;

public interface IProvisionService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<ProvisionResponse> GetByIdAsync(int id);
    Task<ProvisionResponse> CreateAsync(ProvisionRequest request);
    Task<ProvisionResponse> UpdateAsync(int id, ProvisionRequest request);
    Task<int> DeleteAsync(int id);
}

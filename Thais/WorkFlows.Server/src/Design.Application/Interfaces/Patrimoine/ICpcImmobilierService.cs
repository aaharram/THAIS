using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Patrimoine;

public interface ICpcImmobilierService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<CpcImmobilierResponse> GetByIdAsync(int id);
    Task<CpcImmobilierResponse> CreateAsync(CpcImmobilierRequest request);
    Task<CpcImmobilierResponse> UpdateAsync(int id, CpcImmobilierRequest request);
    Task DeleteAsync(int id);
}

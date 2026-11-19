using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface ITaxeService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<TaxeResponse> GetByIdAsync(int id);
    Task<TaxeResponse> CreateAsync(TaxeRequest request);
    Task<TaxeResponse> UpdateAsync(int id, TaxeRequest request);
    Task<int> DeleteAsync(int id);
}

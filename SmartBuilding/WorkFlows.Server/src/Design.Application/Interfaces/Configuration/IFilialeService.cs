using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Configuration;

public interface IFilialeService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<FilialeResponse> GetByIdAsync(int id);
    Task<FilialeResponse> CreateAsync(FilialeRequest request);
    Task<FilialeResponse> UpdateAsync(int id, FilialeRequest request);
    Task<int> DeleteAsync(int id);
}

using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface ISuiviContentieuxService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<SuiviContentieuxResponse> GetByIdAsync(int id);
    Task<SuiviContentieuxResponse> CreateAsync(SuiviContentieuxRequest request);
    Task<SuiviContentieuxResponse> UpdateAsync(int id, SuiviContentieuxRequest request);
    Task<int> DeleteAsync(int id);
    Task<List<EtatContentieuxResponse>> GetEtatContentieuxAsync();
}

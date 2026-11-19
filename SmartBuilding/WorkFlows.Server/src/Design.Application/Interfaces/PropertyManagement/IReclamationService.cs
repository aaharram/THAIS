using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface IReclamationService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<ReclamationResponse> GetByIdAsync(int id);
    Task<ReclamationResponse> CreateAsync(ReclamationRequest request);
    Task<ReclamationResponse> UpdateAsync(int id, ReclamationRequest request);
    Task<int> DeleteAsync(int id);
}

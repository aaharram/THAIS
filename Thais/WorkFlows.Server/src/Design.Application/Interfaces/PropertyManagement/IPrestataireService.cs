using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface IPrestataireService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<PrestataireResponse> GetByIdAsync(int id);
    Task<PrestataireResponse> CreateAsync(PrestataireRequest request);
    Task<PrestataireResponse> UpdateAsync(int id, PrestataireRequest request);
    Task<int> DeleteAsync(int id);
}

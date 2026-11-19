using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface IPrestataireContratService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<PrestataireContratResponse> GetByIdAsync(int id);
    Task<PrestataireContratResponse> CreateAsync(PrestataireContratRequest request);
    Task<PrestataireContratResponse> UpdateAsync(int id, PrestataireContratRequest request);
    Task<int> DeleteAsync(int id);
}

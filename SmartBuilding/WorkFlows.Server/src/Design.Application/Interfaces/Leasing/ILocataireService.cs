using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface ILocataireService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<PagedResult<object>> GetArchivedAsync(GetFilterSearchSortRequest request);
    Task<LocataireResponse> GetByIdAsync(int id);
    Task<LocataireResponse> CreateAsync(LocataireRequest request);
    Task<LocataireResponse> UpdateAsync(int id, LocataireRequest request);
    Task<int> DeleteAsync(int id);
    Task<LocataireResponse> ReactivateAsync(int id);
}

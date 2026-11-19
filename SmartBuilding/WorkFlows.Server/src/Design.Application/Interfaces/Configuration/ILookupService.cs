using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Configuration;

namespace Design.Application.Interfaces.Configuration;

public interface ILookupService<T> where T : LookupEntity
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<LookupResponse> GetByIdAsync(int id);
    Task<LookupResponse> CreateAsync(LookupRequest request);
    Task<LookupResponse> UpdateAsync(int id, LookupRequest request);
    Task<int> DeleteAsync(int id);
}

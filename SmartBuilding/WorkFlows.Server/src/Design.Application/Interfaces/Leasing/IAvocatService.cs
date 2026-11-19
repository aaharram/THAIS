using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IAvocatService
{
    Task<PagedResult<object>> GetAllAsync(int noContentieux, GetFilterSearchSortRequest request);
    Task<AvocatResponse> GetByIdAsync(int id);
    Task<AvocatResponse> CreateAsync(AvocatRequest request);
    Task<AvocatResponse> UpdateAsync(int id, AvocatRequest request);
    Task<int> DeleteAsync(int id);
    Task<Dictionary<int, int>> GetCountsByContentieuxAsync(IEnumerable<int> noContentieuxList);
}

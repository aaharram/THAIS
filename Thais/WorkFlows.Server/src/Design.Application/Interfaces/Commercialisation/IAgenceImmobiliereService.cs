using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Commercialisation;

public interface IAgenceImmobiliereService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<AgenceImmobiliereResponse> GetByIdAsync(int id);
    Task<AgenceImmobiliereResponse> CreateAsync(AgenceImmobiliereRequest request);
    Task<AgenceImmobiliereResponse> UpdateAsync(int id, AgenceImmobiliereRequest request);
    Task<int> DeleteAsync(int id);
}

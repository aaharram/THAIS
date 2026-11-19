using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Commercialisation;

public interface IProspectionService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<ProspectionResponse> GetByIdAsync(int id);
    Task<ProspectionResponse> CreateAsync(ProspectionRequest request);
    Task<ProspectionResponse> UpdateAsync(int id, ProspectionRequest request);
    Task<int> DeleteAsync(int id);
}

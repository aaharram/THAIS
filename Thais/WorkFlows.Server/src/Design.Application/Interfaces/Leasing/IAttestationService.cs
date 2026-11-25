using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IAttestationService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<AttestationResponse> GetByIdAsync(int id);
    Task<AttestationResponse> CreateAsync(AttestationRequest request);
    Task<AttestationResponse> UpdateAsync(int id, AttestationRequest request);
    Task<int> DeleteAsync(int id);
}

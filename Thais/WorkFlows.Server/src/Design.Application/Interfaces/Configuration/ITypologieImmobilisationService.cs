using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Configuration;

public interface ITypologieImmobilisationService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<TypologieImmobilisationResponse> GetByIdAsync(int id);
    Task<TypologieImmobilisationResponse> CreateAsync(TypologieImmobilisationRequest request);
    Task<TypologieImmobilisationResponse> UpdateAsync(int id, TypologieImmobilisationRequest request);
    Task<int> DeleteAsync(int id);
}

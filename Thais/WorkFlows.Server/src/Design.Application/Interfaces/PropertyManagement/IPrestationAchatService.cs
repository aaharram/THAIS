using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface IPrestationAchatService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<PrestationAchatResponse> GetByIdAsync(int id);
    Task<PrestationAchatResponse> CreateAsync(PrestationAchatRequest request);
    Task<PrestationAchatResponse> UpdateAsync(int id, PrestationAchatRequest request);
    Task<PrestationAchatResponse> AmortirAsync(int id, int dureeMois, decimal? taux);
    Task<int> DeleteAsync(int id);
}

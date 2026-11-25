using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Patrimoine;

public interface ILocalService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<PagedResult<object>> GetArchivedAsync(GetFilterSearchSortRequest request);
    Task<LocalResponse> GetByIdAsync(int id);
    Task<LocalResponse> CreateAsync(LocalRequest request);
    Task<LocalResponse> UpdateAsync(int id, LocalRequest request);
    Task<int> DeleteAsync(int id);
    Task<LocalResponse> ReactivateAsync(int id);
    Task<List<LocalVacantResponse>> GetVacantsAsync(int? noProprietaire);
}

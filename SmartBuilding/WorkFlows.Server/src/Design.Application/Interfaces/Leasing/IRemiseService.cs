using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IRemiseService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request, int statut, int annee, int mois);
    Task<List<int>> GetAnneesAsync();
    Task<List<int>> GetMoisAsync(int annee);
    Task AnnulerAsync(List<int> ids);
    Task SupprimerAsync(List<int> ids);
}

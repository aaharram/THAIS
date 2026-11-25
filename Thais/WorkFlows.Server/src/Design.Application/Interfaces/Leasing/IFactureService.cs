using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IFactureService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<FactureResponse> GetByIdAsync(int id);
    Task<FactureResponse> GenererAsync(FactureRequest request);
    Task<FactureResponse> MarquerEditeAsync(int id);
    Task<FactureResponse> DemanderAnnulationAsync(int id);
    Task<FactureResponse> ConfirmerAnnulationAsync(int id);
    Task<FactureResponse> AnnulerDemandeAnnulationAsync(int id);
    Task<int> DeleteAsync(int id);
}

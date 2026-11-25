using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Patrimoine;

public interface ITableauAmortissementService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<TableauAmortissementResponse> GetByIdAsync(int id);
    Task<TableauAmortissementResponse> CreateAsync(TableauAmortissementRequest request);
    Task<TableauAmortissementImportResult> ImportAsync(TableauAmortissementImportRequest request);
    Task<List<AmortissementPeriodeOptionResponse>> GetPeriodesValidationAsync();
    Task<AmortissementValidationResultResponse> ValiderPeriodeAsync(AmortissementValidationRequest request);
    Task<TableauAmortissementResponse> UpdateAsync(int id, TableauAmortissementRequest request);
    Task<int> DeleteAsync(int id);
}

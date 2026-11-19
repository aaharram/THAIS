using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces;

public interface IImportService
{
    Task<ImportResultResponse> ImportLocauxAsync(ImportRequest<LocalImportRow> request);
    Task<ImportResultResponse> ImportActifsAsync(ImportRequest<BuildingImportRow> request);
    Task<ImportResultResponse> ImportLocatairesAsync(ImportRequest<LocataireImportRow> request);
    Task<ImportResultResponse> ImportFilialesAsync(ImportRequest<FilialeImportRow> request);
    Task<ImportResultResponse> ImportTypologiesChargeAsync(ImportRequest<TypologieChargeImportRow> request);
    Task<ImportResultResponse> ImportLookupAsync(string module, ImportRequest<LookupImportRow> request);
}

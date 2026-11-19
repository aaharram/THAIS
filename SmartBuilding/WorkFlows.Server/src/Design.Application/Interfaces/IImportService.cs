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
    Task<ImportResultResponse> ImportPrestatairesAsync(ImportRequest<PrestataireImportRow> request);
    Task<ImportResultResponse> ImportAssurancesAsync(ImportRequest<AssuranceImportRow> request);
    Task<ImportResultResponse> ImportChargesAsync(ImportRequest<ChargeImportRow> request);
    Task<ImportResultResponse> ImportTaxesAsync(ImportRequest<TaxeImportRow> request);
    Task<ImportResultResponse> ImportMembresSyndicAsync(ImportRequest<SyndicImportRow> request);
    Task<ImportResultResponse> ImportTypologiesImmobilisationAsync(ImportRequest<TypologieImmobilisationImportRow> request);
    Task<ImportResultResponse> ImportContratsPrestatairesAsync(ImportRequest<ContratPrestataireImportRow> request);
    Task<ImportResultResponse> ImportBonsCommandeAsync(ImportRequest<BonCommandeImportRow> request);
    Task<ImportResultResponse> ImportPrestationsAchatAsync(ImportRequest<PrestationAchatImportRow> request);
    Task<ImportResultResponse> ImportReclamationsAsync(ImportRequest<ReclamationImportRow> request);
    Task<ImportResultResponse> ImportSinistresAsync(ImportRequest<SinistreImportRow> request);
    Task<ImportResultResponse> ImportLookupAsync(string module, ImportRequest<LookupImportRow> request);
}

using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IPaiementService
{
    Task<PagedResult<object>> GetSummaryAsync(GetFilterSearchSortRequest request, int noProprietaire, int noEncaisseur);
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request, int noProprietaire, int noEncaisseur, int annee, int mois, string? statutAnnulation);
    Task<decimal> GetTotalMontantAsync(string? search, int noProprietaire, int noEncaisseur, int annee, int mois, string? statutAnnulation);
    Task<PaiementResponse> CreateAsync(PaiementRequest request);
    Task<PaiementResponse> DemanderAnnulationAsync(int numero);
    Task<PaiementResponse> RejeterAnnulationAsync(int numero);
    Task<PaiementResponse> ConfirmerAnnulationAsync(int numero);
    Task<ImporterRemiseResponse> ImporterRemiseAsync(ImporterRemiseRequest request);
    Task<RapportComptableResponse> GenererRapportComptableAsync(int annee, int mois, int noProprietaire);
    Task<List<EtatRejetResponse>> GetEtatRejetAsync();
}

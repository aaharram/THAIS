using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IEtatLoyerService
{
    Task<EtatLoyerResponse> GetEtatLoyerAsync(int annee, int mois, int? noBuilding, int? noProprietaire);
    Task<EtatLoyerResponse> ValiderAsync(ValiderEtatLoyerRequest request);
    Task<EtatLoyerResponse> GetHistoriqueAsync(int annee, int mois, int? noBuilding, int? noProprietaire);
    Task<List<PeriodeValideeResponse>> GetPeriodesValideesAsync();
    Task<ImpayesParAgeResponse> GetImpayesParAgeAsync(int? noProprietaire);
    Task<List<SuiviImpayeLigneResponse>> GetSuiviImpayeAsync(int? noProprietaire, int? noEncaisseur);
}

using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IRapportsRecouvrementService
{
    Task<EtatImpayeResponse> GetEtatImpayeAsync();
    Task<ApercuEmissionsEncaissementResponse> GetApercuEmissionsEncaissementAsync(int annee, int mois);
    Task<SuiviEncaissementResponse> GetSuiviEncaissementAsync(int annee, int mois, int? noEncaisseur, int? noBuilding);
    Task<RapportEncaisseurResponse> GetRapportEncaisseurAsync(int annee, int? noEncaisseur);
    Task<PrimeEncaisseurResponse> GetPrimeEncaisseurAsync(int annee, int mois);
}

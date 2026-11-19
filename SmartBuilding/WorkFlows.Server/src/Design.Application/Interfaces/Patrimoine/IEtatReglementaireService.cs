using Design.Contract.Responses;

namespace Design.Application.Interfaces.Patrimoine;

public interface IEtatReglementaireService
{
    Task<EtatReglementaireResponse> GetD21Async();
    Task<EtatReglementaireResponse> GetD05Async();
}

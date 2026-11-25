using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Leasing;

public interface IJournalComptableService
{
    Task<JournalComptableResponse> GetJournalAsync(int annee, int mois, int? noProprietaire, string typeJournal);
    Task<JournalComptableResponse> GenererAsync(GenererJournalComptableRequest request);
    Task<List<JournalComptableGenerationResponse>> GetHistoriqueAsync();
}

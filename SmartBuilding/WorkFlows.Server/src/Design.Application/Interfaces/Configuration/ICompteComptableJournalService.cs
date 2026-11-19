using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Configuration;

public interface ICompteComptableJournalService
{
    Task<List<CompteComptableJournalResponse>> GetAllAsync();
    Task<CompteComptableJournalResponse> CreateAsync(CompteComptableJournalRequest request);
    Task<CompteComptableJournalResponse> UpdateAsync(int id, CompteComptableJournalRequest request);
    Task DeleteAsync(int id);
}

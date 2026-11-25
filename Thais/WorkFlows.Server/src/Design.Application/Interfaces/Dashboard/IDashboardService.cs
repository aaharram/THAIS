using Design.Contract.Responses;

namespace Design.Application.Interfaces.Dashboard;

public interface IDashboardService
{
    Task<DashboardResponse> GetAsync(int? noProprietaire, int? noCity, int? noLocalType, int? noBuilding);

    // RMANew (DataEntryLeasing.vb, ListImmeubles) : la liste déroulante "Actifs" du
    // tableau de bord est elle-même filtrée par les autres sélections.
    Task<List<LookupResponse>> GetActifsAsync(int? noProprietaire, int? noCity, int? noLocalType);
}

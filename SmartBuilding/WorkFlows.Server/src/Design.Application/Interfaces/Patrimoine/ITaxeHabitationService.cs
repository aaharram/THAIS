using Design.Contract.Responses;

namespace Design.Application.Interfaces.Patrimoine;

public interface ITaxeHabitationService
{
    Task<List<TaxeHabitationBuildingResponse>> GetAsync(int? noProprietaire, int? noBuilding);
}

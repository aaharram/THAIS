namespace Design.Contract.Responses;

public class ImporterRemiseResponse
{
    public int NombreAssocies { get; init; }
    public List<string> ReferencesIntrouvables { get; init; } = [];
}

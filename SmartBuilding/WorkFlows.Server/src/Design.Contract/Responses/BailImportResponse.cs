namespace Design.Contract.Responses;

public class BailImportIssueResponse
{
    public int Ligne { get; init; } // numéro de ligne dans la liste envoyée (1 = première ligne de données)
    public string Locataire { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
}

public class BailImportResponse
{
    public int ActifsCrees { get; init; }
    public int LocatairesCrees { get; init; }
    public int LocauxCrees { get; init; }
    public int BauxCrees { get; init; }
    public List<BailImportIssueResponse> Ignorees { get; init; } = [];
}

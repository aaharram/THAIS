namespace Design.Contract.Responses;

public class ImportIssueResponse
{
    public int Ligne { get; init; } // numéro de la ligne dans la liste envoyée (1 = première ligne de données)
    public string Libelle { get; init; } = string.Empty; // nom de l'élément concerné, pour s'y retrouver
    public string Message { get; init; } = string.Empty;
}

public class ImportResultResponse
{
    public int Crees { get; init; }
    public List<ImportIssueResponse> Ignorees { get; init; } = [];
}

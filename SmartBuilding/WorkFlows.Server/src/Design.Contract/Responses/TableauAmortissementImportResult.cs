namespace Design.Contract.Responses;

public class TableauAmortissementImportError
{
    public int Ligne { get; init; } // 1-based, hors en-tête
    public string Motif { get; init; } = null!;
}

public class TableauAmortissementImportResult
{
    public int Importes { get; set; }
    public List<TableauAmortissementImportError> Erreurs { get; init; } = [];
}

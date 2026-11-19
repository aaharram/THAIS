namespace Design.Contract.Responses;

public class BonDeCommandeImportError
{
    public int Ligne { get; init; } // 1-based, hors en-tête
    public string Motif { get; init; } = null!;
}

public class BonDeCommandeImportResult
{
    public int Importes { get; set; }
    public List<BonDeCommandeImportError> Erreurs { get; init; } = [];
}

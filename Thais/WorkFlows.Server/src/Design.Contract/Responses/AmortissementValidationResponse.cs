namespace Design.Contract.Responses;

// RMANew (ListAmortissement.vb, dropdown "Valider tableau d'amortissement") : une entrée
// par mois entre le dernier mois validé (ou 11 mois en arrière si aucun) et le mois en
// cours, chacune marquée "(Validé)" si déjà traitée.
public class AmortissementPeriodeOptionResponse
{
    public DateTime Periode { get; init; }
    public bool Valide { get; init; }
}

public class AmortissementValidationResultResponse
{
    public DateTime Periode { get; init; }
    public int LignesMisesAJour { get; init; }
}

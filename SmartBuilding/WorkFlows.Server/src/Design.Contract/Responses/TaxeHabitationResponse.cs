namespace Design.Contract.Responses;

// RMANew (ViewReporting.aspx "Taxe d'Habitation" -> Classes/TaxeHabitation.vb) : baux
// actifs générant quittance, groupés par actif, avec le loyer net annualisé (base de la
// taxe d'habitation).
public class TaxeHabitationLigneResponse
{
    public string? Article { get; init; } // Building.NoArticle
    public string? Ville { get; init; }
    public string? NomLocataire { get; init; }
    public string? Etage { get; init; }
    public string? NomLocal { get; init; }
    public decimal? Superficie { get; init; }
    public string? Usage { get; init; }
    public decimal LoyerNetAnnuel { get; init; } // LoyerNet * 12
}

public class TaxeHabitationBuildingResponse
{
    public int NoBuilding { get; init; }
    public string NomBuilding { get; init; } = null!;
    public string? CodeImmeuble { get; init; }
    public decimal TotalActif { get; init; }
    public List<TaxeHabitationLigneResponse> Lignes { get; init; } = [];
}

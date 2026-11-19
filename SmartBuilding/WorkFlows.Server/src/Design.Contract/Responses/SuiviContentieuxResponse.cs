namespace Design.Contract.Responses;

public class SuiviContentieuxResponse
{
    public int Numero { get; init; }
    public int? NoLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string? NomLocataire { get; init; }
    public string? NomBuilding { get; init; }
    public string? Ville { get; init; }

    public string? NatureProcedure { get; init; }
    public string? Observation { get; init; }
    public string? Description { get; init; }
    public string StatutDossier { get; init; } = null!;
    public DateTime? DateDebutContentieux { get; init; }
    public DateTime? DateEncaissement { get; init; }
    public decimal? MontantEncaisse { get; init; }
    public decimal? SoldeAnneePrecedente { get; init; }
    public string? PieceJointe { get; init; }

    // RMANew (Location.LoyersImpayes) : calculé ici depuis l'agrégat Facture, comme déjà
    // établi dans RelanceService/PaiementService, plutôt que depuis un champ dénormalisé.
    public decimal MontantImpaye { get; init; }

    // RMANew (ListSuiviJuridique.aspx) : compteur affiché dans la colonne "Avocat",
    // avec lien "+" vers ListAvocat.aspx (sous-liste CRUD scoped par NoContentieux).
    public int AvocatCount { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
}

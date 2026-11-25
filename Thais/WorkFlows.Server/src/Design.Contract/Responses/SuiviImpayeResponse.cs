namespace Design.Contract.Responses;

// RMANew (ViewReporting.aspx "Suivi Impayé" -> Classes/ListImpayesLocataires.vb) : une
// ligne par bail actif ayant un impayé recalculé > 0 (RMANew lit Location.LoyersImpayes,
// un champ dénormalisé absent ici - remplacé par le même recalcul live que
// EtatLoyerService/ImpayesParAge), filtrable par Propriétaire et Encaisseur.
public class SuiviImpayeLigneResponse
{
    public int NoLocation { get; init; }
    public string? NomLocataire { get; init; }
    public string? NomBuilding { get; init; }
    public decimal? LoyerMensuel { get; init; }
    public DateTime? PeriodeImpayesDebut { get; init; }
    public DateTime? PeriodeImpayesFin { get; init; }
    public int NbMoisImpaye { get; init; }
    public decimal MontantImpaye { get; init; }
    public bool Contentieux { get; init; }
    public string? NomEncaisseur { get; init; }
}

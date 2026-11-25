namespace Design.Contract.Responses;

// RMANew (ViewReporting.vb, ExportEtatContentieux) : baux en contentieux
// (SuiviContentieux.StatutDossier="En Contentieux"), export direct au clic (pas de page
// de consultation intermédiaire côté legacy).
public class EtatContentieuxResponse
{
    public DateTime? DateDebutContentieux { get; init; }
    public string? NomLocataire { get; init; }
    public string? NomBuilding { get; init; }
    public string? Ville { get; init; }
    public string? CompteGeneral { get; init; } // "Sous-compte"
    public string? NumContratLocations { get; init; } // "Compte"
    public bool EnCours { get; init; } // true -> "En Cours", false -> DateResiliation formatée
    public DateTime? DateResiliation { get; init; }
    public decimal? LoyerMensuel { get; init; }
    public decimal? SoldeAnneePrecedente { get; init; }
    public decimal EmissionsAnneeCourante { get; init; }
    public decimal ReglementsAnneeCourante { get; init; }
    public decimal SoldeActuel { get; init; }
}

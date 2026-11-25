namespace Design.Contract.Responses;

public class LocataireResponse
{
    public int Numero { get; init; }

    public int TypeLocataire { get; init; }
    public string? Nom { get; init; }
    public string? Prenom { get; init; }
    public string? DesignationEntreprise { get; init; }
    public string NomAffiche { get; init; } = null!; // Nom+Prénom (physique) ou raison sociale (morale)
    public string? Rc { get; init; }
    public string? IdF { get; init; }
    public string? NoCIN { get; init; }
    public string? ICE { get; init; }
    public string? CodeLocataire { get; init; }

    public string? Telephone { get; init; }
    public string? Email { get; init; }
    public string? Adresse { get; init; }
    public string? PostalCode { get; init; }
    public int? NoCity { get; init; }
    public string? NomCity { get; init; }
    public int? NoCountry { get; init; }
    public string? NomCountry { get; init; }
    public string? Notes { get; init; }

    public int? NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int? NoLocal { get; init; }
    public string? NomLocal { get; init; }

    public bool StatutsDispo { get; init; }
    public bool RCDispo { get; init; }
    public bool PieceIdentiteDispo { get; init; }
    public bool AutresDispo { get; init; }
    public int TauxAvancement { get; init; }

    public string? AutreContactNom { get; init; }
    public string? AutreContactPrenom { get; init; }
    public string? AutreContactTelephone { get; init; }
    public string? AutreContactPoste { get; init; }
    public string? AutreContactEmail { get; init; }

    public bool Inactif { get; init; }

    // RMANew (ListArchivesLocataires.vb) : snapshot du dernier bail connu du locataire
    // (actif ou non, le plus récent par Numero) - uniquement peuplé sur la liste Archives,
    // null partout ailleurs (RMANew ne montre ces colonnes que sur cette page-là).
    public decimal? LoyerMensuel { get; init; }
    public DateTime? PeriodeImpayesDebut { get; init; }
    public DateTime? PeriodeImpayesFin { get; init; }
    public int? NbMoisImpaye { get; init; }
    public decimal? MontantImpaye { get; init; }
    public string? Etat { get; init; } // "Normale" / "Contentieux"

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

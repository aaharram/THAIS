using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

public class Locataire : Base
{
    public int TypeLocataire { get; set; } // 0 = physique, 1 = morale
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? DesignationEntreprise { get; set; } // raison sociale (morale)
    public string? Rc { get; set; }
    public string? IdF { get; set; }
    public string? NoCIN { get; set; }
    public string? ICE { get; set; }
    public string? CodeLocataire { get; set; }

    public string? Telephone { get; set; }
    public string? Email { get; set; }
    public string? Adresse { get; set; }
    public string? PostalCode { get; set; }
    public int? NoCity { get; set; }
    public int? NoCountry { get; set; }
    public string? Notes { get; set; }

    public int? NoBuilding { get; set; } // Actif (colonne "ACTIF" de ListLocataire.aspx)
    public int? NoLocal { get; set; }

    // Dossier Administratif (ListLocataire.aspx -> "Taux d'avancement") : suivi de réception
    // des documents, pas de stockage de fichier réel (pas d'infra de stockage dans l'app).
    public bool StatutsDispo { get; set; }
    public bool RCDispo { get; set; }
    public bool PieceIdentiteDispo { get; set; }
    public bool AutresDispo { get; set; }

    public string? AutreContactNom { get; set; }
    public string? AutreContactPrenom { get; set; }
    public string? AutreContactTelephone { get; set; }
    public string? AutreContactPoste { get; set; }
    public string? AutreContactEmail { get; set; }

    public bool Inactif { get; set; }
}

namespace Design.Contract.Requests;

public class LocataireRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public int TypeLocataire { get; set; }
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? DesignationEntreprise { get; set; }
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

    public int? NoBuilding { get; set; }
    public int? NoLocal { get; set; }

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

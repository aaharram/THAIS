//TODO: to clean and add field boolean "enabled"

using Design.Domain.Entities.Users.Enums;

namespace Design.Domain.Entities.Users;

public class User
{
    public int Numero { get; set; }
    public int AddUser { get; set; }
    public DateTime AddDate { get; set; }
    public int ModUser { get; set; }
    public DateTime ModDate { get; set; }
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Company { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string Code { get; set; } = null!;
    public string Tel { get; set; } = null!;
    public string Fax { get; set; } = null!;
    public int NoCountry { get; set; }
    public int NoProvince { get; set; }
    public int? NoCity { get; set; }
    public string UrlPicture { get; set; } = null!;
    public DateTime LastLogin { get; set; }
    public DateTime LastHit { get; set; }
    public int NeedPasswordReset { get; set; } = 0;
    public string? Ipaddress { get; set; }
    public string? Refreshtoken { get; set; }
    public DateTime? Refreshtokenexp { get; set; }
    public PorterStatus Statut { get; set; } //  "Disponible" | "Occupé" | "En pause" | "Non disponible" | "Absent"
    public bool Enabled { get; set; }
    public int NoQuartDeTravail { get; set; }
    public int NoTempsPause { get; set; }
    public DateTime? DateDebutAbsence { get; set; }
    public DateTime? DateFinAbsence { get; set; }
    public string RaisonAbsence { get; set; } = string.Empty;
    public int NoRaisonAbandon { get; set; }
    public decimal? SalaireHoraire { get; set; }
    public int? NoGestionnaire { get; set; }
    public int? PatrimoineType { get; set; }
    public string? SignatureUrl { get; set; }
    public bool GestionMetier { get; set; }
    public bool GestionFinanciere { get; set; }
    public bool GestionAdministrative { get; set; }
}

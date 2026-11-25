using Design.Domain.Entities.Users.Enums;

namespace Design.Contract.Responses;

public class UserResponse
{
    public int Numero { get; set; }
    public int? AddUser { get; set; }
    public string? NameAddUser { get; set; }
    public DateTime AddDate { get; set; }
    public int? ModUser { get; set; }
    public string? NameModUser { get; set; }
    public DateTime ModDate { get; set; }

    public string Username { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Address { get; set; }
    public string Tel { get; set; }
    public int? NoCountry { get; set; }
    public string? NameCountry { get; set; }
    public int? NoProvince { get; set; }
    public string? NameProvince { get; set; }
    public int? NoCity { get; set; }
    public string? NameCity { get; set; }
    public bool? Active { get; set; }
    public string? UrlPicture { get; set; }

    public DateTime LastLogin { get; set; }
    public DateTime LastHit { get; set; }
    public bool Enabled { get; set; }
    
    public string Statut { get; set; }
    public decimal? SalaireHoraire { get; set; }
    public int? NoGestionnaire { get; set; }
    public string? NomGestionnaire { get; set; }
    public int? PatrimoineType { get; set; }
    public string? NomPatrimoineType { get; set; }
    public string? SignatureUrl { get; set; }
    public bool GestionMetier { get; set; }
    public bool GestionFinanciere { get; set; }
    public bool GestionAdministrative { get; set; }
}

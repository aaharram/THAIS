namespace Design.Contract.Requests;

public class UserRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Address { get; set; }
    public string Tel { get; set; }
    public int? NoCountry { get; set; }
    public int? NoProvince { get; set; }
    public int? NoCity { get; set; }
    public bool Enabled { get; set; }
    public decimal? SalaireHoraire { get; set; }
    public int? NoGestionnaire { get; set; }
    public int? PatrimoineType { get; set; }
    public bool GestionMetier { get; set; }
    public bool GestionFinanciere { get; set; }
    public bool GestionAdministrative { get; set; }
}

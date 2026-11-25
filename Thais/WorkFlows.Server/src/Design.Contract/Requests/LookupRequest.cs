namespace Design.Contract.Requests;

public class LookupRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }
    public required string Designation { get; set; }
    public decimal? Taux { get; set; }
    public bool? AccesComplet { get; set; }
}

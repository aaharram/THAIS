namespace Design.Contract.Requests;

public class PrestataireRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required string Designation { get; set; }
    public string? Activite { get; set; }
    public string? TypePrestataire { get; set; }
    public string? Enseigne { get; set; }
    public string? Rc { get; set; }
    public string? Idf { get; set; }
    public string? Ice { get; set; }
    public string? Adresse { get; set; }
    public string? PostalCode { get; set; }
    public int? NoVille { get; set; }
    public string? Pays { get; set; }
    public string? Notes { get; set; }
}

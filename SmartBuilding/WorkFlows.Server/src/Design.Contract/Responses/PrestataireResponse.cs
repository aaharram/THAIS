namespace Design.Contract.Responses;

public class PrestataireResponse
{
    public int Numero { get; init; }

    public string Designation { get; init; } = null!;
    public string? Activite { get; init; }
    public string? TypePrestataire { get; init; }
    public string? Enseigne { get; init; }
    public string? Rc { get; init; }
    public string? Idf { get; init; }
    public string? Ice { get; init; }
    public string? Adresse { get; init; }
    public string? PostalCode { get; init; }
    public int? NoVille { get; init; }
    public string? NomVille { get; init; }
    public string? Pays { get; init; }
    public string? Notes { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

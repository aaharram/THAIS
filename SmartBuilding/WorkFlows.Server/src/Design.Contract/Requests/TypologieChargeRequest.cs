namespace Design.Contract.Requests;

public class TypologieChargeRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }
    public required string Typologie { get; set; }
    public string? Compte { get; set; }
    public string? Description { get; set; }
}

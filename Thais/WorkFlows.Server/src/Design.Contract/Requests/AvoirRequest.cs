namespace Design.Contract.Requests;

public class AvoirRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoFacture { get; set; }
    public required DateTime DateAvoir { get; set; }
    public required decimal Montant { get; set; }
    public string? Notes { get; set; }
}

namespace Design.Contract.Requests;

public class VncRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public decimal? MontantVNC { get; set; }
    public DateTime? DateVNC { get; set; }
}

namespace Design.Contract.Requests;

public class ProvisionRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public decimal? MontantProvision { get; set; }
    public DateTime? DateProvision { get; set; }
}

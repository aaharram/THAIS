namespace Design.Contract.Requests;

public class RelanceRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoLocation { get; set; }
    public required string TypeRelance { get; set; }
    public DateTime? DateRelance { get; set; }
    public string? TypeEnvoi { get; set; }
    public string? Notes { get; set; }
}

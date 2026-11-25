namespace Design.Contract.Requests;

public class AmortissementValidationRequest
{
    public int? AddUser { get; set; }
    public required DateTime Periode { get; set; }
}

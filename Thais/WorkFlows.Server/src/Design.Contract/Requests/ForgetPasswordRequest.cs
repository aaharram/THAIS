namespace Design.Contract.Requests;

public class ForgetPasswordRequest
{
    public string? Email { get; set; }
    public string? Tel { get; set; }
}
namespace Design.Contract.Requests;

public class FirstResetPasswordRequest
{
    public required string Username { get; set; }
    public required string NewPassword { get; set; }
}
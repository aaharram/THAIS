namespace Design.Contract.Requests;

public class ResetPasswordRequest
{
    public string? Username { get; set; }
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
}
namespace Design.Contract.Requests;

public class AuthRequest
{
    public string? Username { get; set; }
    public string? Password { get; set; }

    public bool isLdap { get; set; } = false;
}

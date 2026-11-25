namespace Design.Contract.Requests;

public class LogoutRequest
{
    public required string UserName { get; set; }
    public bool ForcedLogout { get; set; }
}
namespace Design.Contract.Common;

public class UserContext
{
    public int UserId { get; init; }
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Browser { get; set; } = string.Empty;
}

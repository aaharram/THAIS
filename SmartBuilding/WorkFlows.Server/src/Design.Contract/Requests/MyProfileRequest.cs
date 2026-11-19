namespace Design.Contract.Requests;

public class MyProfileRequest
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Tel { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

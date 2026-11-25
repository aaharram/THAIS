namespace Design.Contract.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }

    public string Status { get; set; } = string.Empty;
}

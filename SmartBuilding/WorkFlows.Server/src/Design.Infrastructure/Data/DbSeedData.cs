namespace Design.Infrastructure.Data;

public static class DbSeedData
{
    public const int AdminServiceProfilId = 1;
    public const int AdminUserId = 1;
    public const int EmployeeUserId = 2;
    public const string AdminUsername = "admin";
    public const string EmployeeUsername = "employee";
    public const string AdminPasswordPlain = "123";
    public const string EmployeePasswordPlain = "123";

    // BCrypt hash of "123" (same hash reused since both seed accounts share the same password)
    public const string AdminPasswordHash =
        "$2a$11$6OZ/8eRT8ibXOQisN8MT0.d3Dh9I4ZLjFH5yjfg/a26p/PmDjam3i";
    public const string EmployeePasswordHash = AdminPasswordHash;

    public static readonly DateTime SeedTimestamp = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
}

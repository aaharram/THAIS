using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Design.Infrastructure.Data;

public class DbDesignContextFactory : IDesignTimeDbContextFactory<DbDesignContext>
{
    public DbDesignContext CreateDbContext(string[] args)
    {
        string env = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";

        IConfigurationRoot configuration = new ConfigurationBuilder()
            .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "..", "Design.Api"))
            .AddJsonFile($"appsettings.{env}.json", false)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<DbDesignContext>();
        string? connectionString = configuration.GetConnectionString("DefaultConnection");

        optionsBuilder.UseSqlServer(connectionString);

        return new DbDesignContext(optionsBuilder.Options);
    }
}

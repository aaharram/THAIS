using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Design.Infrastructure.Data;

namespace Design.Infrastructure.Extensions;

public static class DatabaseExtensions
{
    public static void AddSqlServerCollection(this IServiceCollection services,
        IConfiguration configuration,
        bool isDevelopment)
    {
        services.AddDbContext<DbDesignContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"))
                .EnableSensitiveDataLogging(isDevelopment)
                .LogTo(Console.WriteLine, LogLevel.Information));
    }
}

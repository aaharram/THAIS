using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Design.Infrastructure.Extensions;

namespace Design.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration, bool isDevelopment)
    {
        services.AddSqlServerCollection(configuration, isDevelopment);
        services.AddRepositories();

        return services;
    }
}

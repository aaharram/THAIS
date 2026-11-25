using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Design.Application.Extensions;

namespace Design.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddValidations();
        services.AddServices();
        services.AddAutoMapping();

        return services;
    }
}

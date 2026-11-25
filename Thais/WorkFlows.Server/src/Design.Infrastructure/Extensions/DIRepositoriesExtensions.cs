using Microsoft.Extensions.DependencyInjection;
using Design.Infrastructure.Interfaces;
using Design.Infrastructure.Repositories;

namespace Design.Infrastructure.Extensions;

public static class DIRepositoriesExtensions
{
    public static void AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
    }
}

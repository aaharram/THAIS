using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Design.Application.Features.Users.Mappers;

namespace Design.Application.Extensions;

public static class AutoMappingExtensions
{
    public static IServiceCollection AddAutoMapping(this IServiceCollection services)
    {
        services.AddAutoMapper(Assembly.GetAssembly(typeof(UserProfile)));
        return services;
    }
}

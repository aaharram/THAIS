using System.Reflection;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.Extensions.DependencyInjection;

namespace Design.Application.Extensions;

public static class ValidationServiceCollectionExtensions
{
    public static IServiceCollection AddValidations(this IServiceCollection services)
    {
        // Automatically registers all IValidator<T> in this assembly
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Optional: if you want to enable automatic validation in ASP.NET Core
        // (applies FluentValidation rules to [ApiController] model binding)
        services.AddFluentValidationAutoValidation();
        services.AddFluentValidationClientsideAdapters();

        return services;
    }
}

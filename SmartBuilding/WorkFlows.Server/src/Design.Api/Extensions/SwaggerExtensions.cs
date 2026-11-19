using Microsoft.OpenApi.Models;

namespace Design.Api.Extensions;

public static class SwaggerExtensions
{
    public static void AddSwaggerCollection(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(option =>
        {
            option.CustomSchemaIds(type => type.FullName?.Replace("+", "."));
            option.SwaggerDoc("v1",
                new OpenApiInfo { Title = "Design Server", Version = "v1", Description = "Design Server API" });
            option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                In = ParameterLocation.Header,
                Description = "Please enter a valid token",
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                BearerFormat = "JWT",
                Scheme = "Bearer"
            });
            option.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    []
                }
            });
        });
    }
}

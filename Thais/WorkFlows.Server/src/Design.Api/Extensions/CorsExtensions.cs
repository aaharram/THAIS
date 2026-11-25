namespace Design.Api.Extensions;

public static class CorsExtensions
{
    public static void AddCorsPolicy(this IServiceCollection services)
    {
        services.AddCors(options => options.AddPolicy("CorsPolicy", policyBuilder => policyBuilder
                    .SetIsOriginAllowed(_ => true)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()));
    }
}

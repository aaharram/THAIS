using System.Security.Cryptography.X509Certificates;
using System.Text.Json.Serialization;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Design.Api.Extensions;
using Design.Api.Middleware;
using Design.Application;
using Design.Infrastructure;
using Design.Infrastructure.Data;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    string crtsDir = Path.Combine(builder.Environment.ContentRootPath, "..", "..", "..", "WorkFlows.Client", "crts");
    string certPath = Path.Combine(crtsDir, "localhost-cert.pem");
    string keyPath = Path.Combine(crtsDir, "localhost-key.pem");

    if (File.Exists(certPath) && File.Exists(keyPath))
    {
        using X509Certificate2 ephemeralCert = X509Certificate2.CreateFromPemFile(certPath, keyPath);
        X509Certificate2 devCert = new(ephemeralCert.Export(X509ContentType.Pfx));

        builder.WebHost.ConfigureKestrel(options =>
        {
            options.ListenAnyIP(5275);
            options.ListenAnyIP(7208, listenOptions => listenOptions.UseHttps(devCert));
        });
    }
}

// 🔹 Serilog setup
builder.Host.UseSerilog((context, loggerConfig) =>
    loggerConfig.ReadFrom.Configuration(context.Configuration));

builder.Services.AddControllers().AddJsonOptions(options => options
    .JsonSerializerOptions
    .DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull);

// Register MemoryCache
builder.Services.AddMemoryCache();

builder.Services.AddSingleton<IMemoryCache>(sp =>
{
    var cache = new MemoryCache(new MemoryCacheOptions
    {
        SizeLimit = 1024,
        TrackStatistics = true
    });

    return cache;
});

builder.Services.AddSwaggerCollection();
builder.Services.AddAuthCollection(builder.Configuration);
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.IsDevelopment());
builder.Services.AddCorsPolicy();
builder.Services.AddOpenTelemetry()
    .ConfigureResource(res => res.AddService("design-api"))
    .WithTracing(tracing =>
    {
        tracing.AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation();
        tracing.AddOtlpExporter();
    }).WithMetrics(metrics =>
    {
        metrics.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation();

        metrics.AddOtlpExporter().AddPrometheusExporter();
    });
builder.Services.AddHealthChecks();

// 🔹 Services
builder.Services.AddApplication(builder.Configuration);

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using IServiceScope scope = app.Services.CreateScope();
    DbDesignContext dbContext = scope.ServiceProvider.GetRequiredService<DbDesignContext>();
    dbContext.Database.Migrate();
}

// 🔹 Static files
app.UseConfiguredStaticFiles(builder.Environment, "Infrastructure/Uploads");

// 🔹 Swagger (dev only)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 🔹 Middleware
// Middleware to handle exceptions globally
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        // Default to 500
        int statusCode = StatusCodes.Status500InternalServerError;

        // Map specific exception types to HTTP status codes
        switch (ex)
        {
            case ValidationException:
                statusCode = StatusCodes.Status400BadRequest;
                break;
            case KeyNotFoundException:
                statusCode = StatusCodes.Status404NotFound;
                break;
            case UnauthorizedAccessException:
                statusCode = StatusCodes.Status403Forbidden;
                break;
            case InvalidOperationException:
                statusCode = StatusCodes.Status400BadRequest;
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        // Create a consistent JSON structure
        var errorResponse = new
        {
            error = new
            {
                message = ex.Message,
                type = ex.GetType().Name
            }
        };

        await context.Response.WriteAsJsonAsync(errorResponse);
    }
});

app.UseSerilogRequestLogging();
app.UseRouting();
app.UseCors("CorsPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ValidateTokenMiddleware>();

// 🔹 Endpoints
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

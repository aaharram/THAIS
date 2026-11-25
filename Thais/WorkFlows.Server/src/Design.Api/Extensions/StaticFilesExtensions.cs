using Microsoft.Extensions.FileProviders;

namespace Design.Api.Extensions;

public static class StaticFilesExtensions
{
    public static void UseConfiguredStaticFiles(this IApplicationBuilder app, IWebHostEnvironment env,
        string relativePath)
    {
        app.UseDefaultFiles();

        string fullPath = Path.Combine(env.ContentRootPath, relativePath);

        if (!Directory.Exists(fullPath))
        {
            Directory.CreateDirectory(fullPath);
        }

        // Ensure sub-folders exist
        Directory.CreateDirectory(Path.Combine(fullPath, "profiles"));

        // Serve files under /uploads → Infrastructure/Uploads
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(fullPath),
            RequestPath = "/uploads"
        });
    }
}

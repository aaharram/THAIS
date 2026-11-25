using FluentValidation;
using Design.Application.Common;
using Design.Contract.Common;

namespace Design.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await next(httpContext); 
        }
        catch (Exception ex)
        {
            string traceId = httpContext.TraceIdentifier;
            logger.LogError(ex, "An unhandled exception occurred. TraceId: {TraceId}", traceId);
            ErrorResponse response = GetErrorResponse(ex, traceId);
            httpContext.Response.StatusCode = response.Status;
            httpContext.Response.ContentType = "application/json";
            await httpContext.Response.WriteAsJsonAsync(response);
        }
    }

    private static ErrorResponse GetErrorResponse(Exception ex, string traceId)
    {
        int statusCode = 500; 
        string error = "Internal Server Error";
        string message = "Une erreur inattendue s'est produite.";
        
        switch (ex)
        {
            case KeyNotFoundException _:
                statusCode = 404;
                error = "Not Found";
                message = "Le service spécifié est introuvable.";
                break;
            case UnauthorizedAccessException _:
                statusCode = 403;
                error = "Forbidden";
                message = "Accès interdit.";
                break;
            case ArgumentException _:
            case ValidationException _:
                statusCode = 400;
                error = "Bad Request";
                message = "Requête invalide.";
                break;
        }

        return new ErrorResponse(statusCode)
        {
            Error = error,
            Message = message,
            Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
            TraceId = traceId
        };
    }
}

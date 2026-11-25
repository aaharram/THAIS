namespace Design.Contract.Common;

public class ApiResponse<T>
{
    public T? Data { get; set; }
    public MetadataResponse? Metadata { get; set; }
    public List<ErrorResponse> Errors { get; set; } = [];
    public string TraceId { get; set; }

    // Constructeur pour succès
    public ApiResponse(T data, MetadataResponse? metadata, string? traceId)
    {
        Data = data;
        Metadata = metadata;
        TraceId = traceId ?? string.Empty;
    }

    // Constructeur pour erreur
    public ApiResponse(List<ErrorResponse> errors, string? traceId)
    {
        Errors = errors;
        TraceId = traceId ?? string.Empty;
    }
}

namespace Design.Contract.Common;

public class ErrorResponse(int status)
{
    public int Status { get; } = status;
    public string Error { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string Timestamp { get; init; } = string.Empty;
    public string TraceId { get; init; } = string.Empty;
    public List<string>? Details { get; init; }
}

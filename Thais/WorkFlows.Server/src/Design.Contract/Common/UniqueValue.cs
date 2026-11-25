namespace Design.Contract.Common;

public class UniqueValue
{
    public object? Value { get; set; }
    public string? Label { get; set; } = string.Empty;
    public int Count { get; set; }
}

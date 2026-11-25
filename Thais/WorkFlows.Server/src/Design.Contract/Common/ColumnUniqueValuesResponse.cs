namespace Design.Contract.Common;

public class ColumnUniqueValuesResponse
{
    public string ColumnName { get; set; }
    public List<UniqueValue> Values { get; set; } = [];
}

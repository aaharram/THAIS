namespace Design.Contract.Common;

public class FilterCriteria
{
    public string Field { get; set; }
    public List<string?> Values { get; set; } = [];
}

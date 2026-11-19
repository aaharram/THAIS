namespace Design.Contract.Common;

public class GetFilterSearchSortRequest : PagedRequest
{
    public string? Search { get; set; }
    public List<FilterCriteria>? Filters { get; set; }
    public string? SortField { get; set; }
    public SortOrder SortOrder { get; set; } = SortOrder.Unsorted;
    
    public bool ShowDisabled { get; set; } = false;
}

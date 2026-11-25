namespace Design.Contract.Common;

public class PagedRequest
{
    public bool ForSelect { get; set; } = false;
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

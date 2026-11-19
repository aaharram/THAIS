namespace Design.Contract.Common;

public class PagedResult<T>
{
    public List<T> Items { get; init; }
    public int TotalCount { get; init; }
    public int PageNumber { get; init; }
    public int PageSize { get; init; }


    public static PagedResult<T> Empty(int pageNumber, int pageSize)
    {
        return new PagedResult<T>
        {
            Items = new List<T>(),
            TotalCount = 0,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
}

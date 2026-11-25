using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.PropertyManagement;

public interface ISinistreService
{
    Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request);
    Task<SinistreResponse> GetByIdAsync(int id);
    Task<SinistreResponse> CreateAsync(SinistreRequest request);
    Task<SinistreResponse> UpdateAsync(int id, SinistreRequest request);
    Task<int> DeleteAsync(int id);
    Task<SinistreResponse> UpdateAttachmentAsync(int id, string kind, string fileName);
    Task<string?> GetAttachmentFileNameAsync(int id, string kind);
}

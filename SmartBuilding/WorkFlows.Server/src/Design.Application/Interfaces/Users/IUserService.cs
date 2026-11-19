using System.Security.Claims;
using Design.Application.Common;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;

namespace Design.Application.Interfaces.Users;

public interface IUserService
{
    Task<List<ColumnUniqueValuesResponse>> GetUniqueValuesAsync(List<string> columnNames);
    Task<PagedResult<object>> GetAllMembersAsync(GetFilterSearchSortRequest request);

    Task<UserResponse> GetByIdAsync(int id);

    Task<UserResponse> CreateAsync(UserRequest request);

    Task<UserResponse> UpdateAsync(int id, UserRequest request);

    Task<int> DeleteAsync(int id);

    Task<UserResponse> GetMyProfileAsync(int id);

    Task<UserResponse> UpdateMyProfileAsync(int id, MyProfileRequest request);

    Task<UserResponse> UpdateProfilePictureAsync(int id, string fileName);

    Task<(string physicalPath, string mimeType)?> GetProfilePicturePhysicalPathAsync(int id, string uploadRoot);

    Task<UserResponse> UpdateSignatureAsync(int id, string fileName);

    Task<(string physicalPath, string mimeType)?> GetSignaturePhysicalPathAsync(int id, string uploadRoot);

    UserContext ExtractFromClaims(ClaimsPrincipal user);
}

using System.Reflection;
using System.Security.Claims;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Users;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Users;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Users;

public class UserService(IMapper mapper, DbDesignContext context, ILogger<IUserService> logger)
    : IUserService
{
    // Get unique column values
    public async Task<List<ColumnUniqueValuesResponse>> GetUniqueValuesAsync(List<string> columnNames)
    {
        var result = new List<ColumnUniqueValuesResponse>();

        foreach (string column in columnNames)
        {
            List<UniqueValue> values;

            PropertyInfo? property = typeof(User).GetProperty(column,
                BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);

            if (property == null)
            {
                throw new ArgumentException($"Invalid column name: {column}");
            }

            values = await context.Users
                .GroupBy(b => EF.Property<object>(b, property.Name))
                .Select(g => new UniqueValue
                {
                    Value = g.Key,
                    Label = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();

            result.Add(new ColumnUniqueValuesResponse
            {
                ColumnName = column,
                Values = values
            });
        }

        return result;
    }


    public async Task<PagedResult<object>> GetAllMembersAsync(GetFilterSearchSortRequest request)
    {
        try
        {
            logger.LogInformation("Fetching all members...");

            if (request.PageNumber < 1)
            {
                request.PageNumber = 1;
            }

            if (request.PageSize < 1 || request.PageSize > 100)
            {
                request.PageSize = 10;
            }

            IQueryable<User> query = context.Users.AsQueryable();

            if (!request.ShowDisabled)
            {
                query = query.Where(s => s.Enabled);
            }

            // Apply search
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(b => b.Name.ToLower().Contains(search));
            }

            // Apply filters using the extension method
            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            // Apply sorting using the extension method
            if (!string.IsNullOrWhiteSpace(request.SortField))
            {
                query = query.ApplySorting(request.SortField, request.SortOrder);
            }

            // Calculate total count before pagination
            int totalCount = await query.CountAsync();

            // For Select (optimized select query for paginated data)
            if (request.ForSelect)
            {
                var selectMembers = await query
                    .Select(m => new
                    {
                        m.Numero,
                        Name = m.FirstName.Trim() + " " + m.LastName.Trim(),
                    })
                    .Skip((request.PageNumber - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                return new PagedResult<object>
                {
                    Items = selectMembers.Cast<object>().ToList(),
                    TotalCount = totalCount,
                    PageNumber = request.PageNumber,
                    PageSize = request.PageSize
                };
            }

            // Fetching the full members list (e.g., for detailed info)
            List<User> members = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var memberIds = members.Select(m => m.Numero).ToList();

            var allMembers = await context.Users
                .Where(m => memberIds.Contains(m.Numero))
                .Select(m => new
                {
                    m.Numero,
                    m.FirstName,
                    m.LastName
                })
                .ToListAsync();

            var serviceProfils = await context.ServiceProfils
                .Select(sp => new { sp.Numero, sp.Designation })
                .ToListAsync();

            logger.LogInformation("{MembersCount} Users fetched.", members.Count);

            // Map members to response DTO
            IEnumerable<UserResponse>? mappedMembers = mapper.Map<IEnumerable<UserResponse>>(members, opts =>
            {
                opts.Items["Users"] = allMembers;
                opts.Items["ServiceProfils"] = serviceProfils;
            });

            return new PagedResult<object>
            {
                Items = mappedMembers.Cast<object>().ToList(),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }
        catch (Exception ex)
        {
            logger.LogError("Error fetching all members: {ExMessage}", ex.Message);
            throw;
        }
    }

    Task<UserResponse> IUserService.GetByIdAsync(int id)
    {
        return GetByIdAsync(id);
    }

    Task<UserResponse> IUserService.CreateAsync(UserRequest request)
    {
        return CreateAsync(request);
    }

    Task<UserResponse> IUserService.UpdateAsync(int id, UserRequest request)
    {
        return UpdateAsync(id, request);
    }


    public async Task<UserResponse> GetByIdAsync(int id)
    {
        try
        {
            logger.LogInformation("Fetching members with ID {Id}...", id);
            User? members = await context.Users
                .FirstOrDefaultAsync(p => p.Numero == id);

            var allMembers = await context.Users
                .Select(m => new
                {
                    m.Numero,
                    m.FirstName,
                    m.LastName
                })
                .ToListAsync();
            var serviceProfils = await context.ServiceProfils
                .Select(sp => new { sp.Numero, sp.Designation })
                .ToListAsync();
            if (members == null)
            {
                logger.LogWarning("User with ID {Id} not found.", id);
                throw new KeyNotFoundException("User not found");
            }

            logger.LogInformation("User with ID {Id} fetched successfully.", id);

            UserResponse? mappedMember = mapper.Map<UserResponse>(members, opts =>
            {
                opts.Items["Users"] = allMembers;
                opts.Items["ServiceProfils"] = serviceProfils;
            });

            return mappedMember;
        }
        catch (Exception ex)
        {
            logger.LogError("Error fetching member with ID {Id}: {ExMessage}", id, ex.Message);
            throw;
        }
    }

    // Crée un mot de passe temporaire basé sur le nom complet
    private static string GenerateTemporaryPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public async Task<UserResponse> CreateAsync(UserRequest request)
    {
        try
        {
            logger.LogInformation("Creating a new member...");
            User? member = mapper.Map<User>(request);
            member.AddDate = DateTime.UtcNow;
            member.Code = string.IsNullOrWhiteSpace(member.Code) ? "" : member.Code;
            member.Fax = string.IsNullOrWhiteSpace(member.Fax) ? "" : member.Fax;
            member.UrlPicture = string.IsNullOrWhiteSpace(member.UrlPicture) ? "" : member.UrlPicture;
            member.SignatureUrl = string.IsNullOrWhiteSpace(member.SignatureUrl) ? "" : member.SignatureUrl;
            member.Company = string.IsNullOrWhiteSpace(member.Company) ? "" : member.Company;
            member.Enabled = request.Enabled;
            member.NoCity = request.NoCity ?? 0;
            member.Address = string.IsNullOrWhiteSpace(member.Address) ? "" : member.Address;
            member.Name = request.FirstName + " " + request.LastName;
            member.Tel = string.IsNullOrWhiteSpace(member.Tel) ? "" : member.Tel;

            // Générer un mot de passe temporaire
            member.Password = GenerateTemporaryPassword(request.Password);
            member.Username = request.Username;
            member.NeedPasswordReset = 0;

            context.Users.Add(member);

            await context.SaveChangesAsync();

            logger.LogInformation("User with ID {MemberNumero} created successfully.", member.Numero);

            var allMembers = await context.Users
                .Select(m => new
                {
                    m.Numero,
                    m.FirstName,
                    m.LastName
                })
                .ToListAsync();
            var serviceProfils = await context.ServiceProfils
                .Select(sp => new { sp.Numero, sp.Designation })
                .ToListAsync();
            UserResponse? mappedMember = mapper.Map<UserResponse>(member, opts =>
            {
                opts.Items["Users"] = allMembers;
                opts.Items["ServiceProfils"] = serviceProfils;
            });

            return mappedMember;
        }
        catch (Exception ex)
        {
            logger.LogError("Error creating member: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<UserResponse> UpdateAsync(int id, UserRequest request)
    {
        try
        {
            logger.LogInformation("Updating permission with ID {Id}...", id);

            User? member = await context.Users
                .FirstOrDefaultAsync(p => p.Numero == id);

            if (member == null)
            {
                logger.LogWarning("User with ID {Id} not found.", id);
                throw new KeyNotFoundException("User not found");
            }

            mapper.Map(request, member);
            member.Enabled = request.Enabled;
            member.ModDate = DateTime.UtcNow;

            await context.SaveChangesAsync();

            logger.LogInformation("User with ID {Id} updated successfully.", id);

            var allMembers = await context.Users
                .Select(m => new
                {
                    m.Numero,
                    m.FirstName,
                    m.LastName
                })
                .ToListAsync();
            var serviceProfils = await context.ServiceProfils
                .Select(sp => new { sp.Numero, sp.Designation })
                .ToListAsync();
            UserResponse? mappedMember = mapper.Map<UserResponse>(member, opts =>
            {
                opts.Items["Users"] = allMembers;
                opts.Items["ServiceProfils"] = serviceProfils;
            });

            return mappedMember;
        }
        catch (Exception ex)
        {
            logger.LogError("Error updating member with ID {Id}: {ExMessage}", id, ex.Message);
            throw;
        }
    }

    public async Task<int> DeleteAsync(int id)
    {
        try
        {
            logger.LogInformation("Attempting to delete member with ID {Id}...", id);

            DbSet<User> context1 = context.Users;

            User? member = await context1.FindAsync(id);

            if (member == null)
            {
                logger.LogWarning("User with ID {Id} not found.", id);
                return 0;
            }

            context1.Remove(member);

            int result = await context.SaveChangesAsync();

            if (result > 0)
            {
                logger.LogInformation("User with ID {Id} deleted successfully.", id);
            }
            else
            {
                logger.LogWarning("Failed to delete member with ID {Id}.", id);
            }

            return result;
        }
        catch (Exception ex)
        {
            logger.LogError("Error deleting member with ID {Id}: {ExMessage}", id, ex.Message);
            throw;
        }
    }

    public async Task<UserResponse> GetMyProfileAsync(int id)
    {
        return await GetByIdAsync(id);
    }

    public async Task<UserResponse> UpdateMyProfileAsync(int id, MyProfileRequest request)
    {
        User? member = await context.Users.FirstOrDefaultAsync(p => p.Numero == id);
        if (member == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        member.FirstName = request.FirstName.Trim();
        member.LastName = request.LastName.Trim();
        member.Name = $"{request.FirstName.Trim()} {request.LastName.Trim()}";
        member.Email = request.Email.Trim();
        member.Tel = request.Tel?.Trim() ?? string.Empty;
        member.Address = request.Address?.Trim() ?? string.Empty;
        member.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<UserResponse> UpdateProfilePictureAsync(int id, string fileName)
    {
        User? member = await context.Users.FirstOrDefaultAsync(p => p.Numero == id);
        if (member == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        member.UrlPicture = fileName;
        member.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<(string physicalPath, string mimeType)?> GetProfilePicturePhysicalPathAsync(int id, string uploadRoot)
    {
        User? member = await context.Users.FirstOrDefaultAsync(p => p.Numero == id);
        if (member == null || string.IsNullOrWhiteSpace(member.UrlPicture))
        {
            return null;
        }

        string ext = Path.GetExtension(member.UrlPicture).ToLowerInvariant();
        string mimeType = ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };

        string path = Path.Combine(uploadRoot, id.ToString(), member.UrlPicture);
        return (path, mimeType);
    }

    public async Task<UserResponse> UpdateSignatureAsync(int id, string fileName)
    {
        User? member = await context.Users.FirstOrDefaultAsync(p => p.Numero == id);
        if (member == null)
        {
            throw new KeyNotFoundException("User not found");
        }

        member.SignatureUrl = fileName;
        member.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<(string physicalPath, string mimeType)?> GetSignaturePhysicalPathAsync(int id, string uploadRoot)
    {
        User? member = await context.Users.FirstOrDefaultAsync(p => p.Numero == id);
        if (member == null || string.IsNullOrWhiteSpace(member.SignatureUrl))
        {
            return null;
        }

        string ext = Path.GetExtension(member.SignatureUrl).ToLowerInvariant();
        string mimeType = ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            _ => "application/octet-stream"
        };

        string path = Path.Combine(uploadRoot, id.ToString(), member.SignatureUrl);
        return (path, mimeType);
    }

    public UserContext ExtractFromClaims(ClaimsPrincipal user)
    {
        if (user.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException("Utilisateur non authentifié.");
        }

        try
        {
            string userId = GetRequiredClaimValue(user, ClaimTypes.NameIdentifier);
            string username = GetClaimValue(user, ClaimTypes.Name);
            string firstName = GetClaimValue(user, ClaimTypes.GivenName);
            string lastName = GetClaimValue(user, ClaimTypes.Surname);
            string role = GetClaimValue(user, ClaimTypes.Role);

            return new UserContext
            {
                UserId = ParseInt(userId, ClaimTypes.NameIdentifier),
                Username = username ?? string.Empty,
                FirstName = firstName ?? string.Empty,
                LastName = lastName ?? string.Empty,
                Role = role ?? string.Empty,
                IpAddress = string.Empty,
                Browser = string.Empty
            };
        }
        catch (Exception ex) when (ex is not UnauthorizedAccessException)
        {
            throw new UnauthorizedAccessException("Erreur lors de l'extraction des informations utilisateur.", ex);
        }
    }

    private string GetRequiredClaimValue(ClaimsPrincipal user, string claimType)
    {
        string? value = GetClaimValue(user, claimType);
        if (string.IsNullOrEmpty(value))
        {
            throw new UnauthorizedAccessException($"Claim requis manquant: {claimType}");
        }

        return value!;
    }

    private string? GetClaimValue(ClaimsPrincipal user, string claimType)
    {
        return user.FindFirst(claimType)?.Value;
    }

    private int ParseInt(string? value, string claimType, int defaultValue = 0)
    {
        if (string.IsNullOrEmpty(value))
        {
            return defaultValue;
        }

        if (int.TryParse(value, out int result))
        {
            return result;
        }

        throw new UnauthorizedAccessException($"Valeur invalide pour le claim {claimType}: '{value}'");
    }
}

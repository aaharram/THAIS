using Microsoft.EntityFrameworkCore;
using Design.Domain.Entities.Users;
using Design.Infrastructure.Data;
using Design.Infrastructure.Interfaces;

namespace Design.Infrastructure.Repositories;

public class UserRepository(DbDesignContext context) : IUserRepository
{
    public async Task<User> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await context.Users
            .FirstOrDefaultAsync(m => m.Username == username, cancellationToken);
    }

    public async Task<User> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await context.Users
            .FirstOrDefaultAsync(m => m.Email == email, cancellationToken);
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        context.Users.Update(user);
        await context.SaveChangesAsync(cancellationToken);
    }

    public Task<User?> GetByIdAsync(int numero)
    {
        return context.Users
            .FirstOrDefaultAsync(m => m.Numero == numero);
    }

    public async Task<List<User>> GetByIdsAsync(IEnumerable<int> ids)
    {
        return await context.Users
            .Where(u => ids.Contains(u.Numero))
            .ToListAsync();
    }
}

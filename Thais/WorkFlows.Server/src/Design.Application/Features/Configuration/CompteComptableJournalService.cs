using Microsoft.EntityFrameworkCore;
using Design.Application.Interfaces.Configuration;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Configuration;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Configuration;

public class CompteComptableJournalService(DbDesignContext context) : ICompteComptableJournalService
{
    private static CompteComptableJournalResponse ToResponse(CompteComptableJournal entity) => new()
    {
        Numero = entity.Numero,
        TypeJournal = entity.TypeJournal,
        TypeSequenceComptable = entity.TypeSequenceComptable,
        CompteDebit = entity.CompteDebit,
        CompteCredit = entity.CompteCredit,
        SousCompte = entity.SousCompte,
        Description = entity.Description
    };

    public async Task<List<CompteComptableJournalResponse>> GetAllAsync()
    {
        return await context.ComptesComptableJournal
            .OrderBy(e => e.TypeJournal).ThenBy(e => e.TypeSequenceComptable)
            .Select(e => ToResponse(e))
            .ToListAsync();
    }

    public async Task<CompteComptableJournalResponse> CreateAsync(CompteComptableJournalRequest request)
    {
        bool doublon = await context.ComptesComptableJournal.AnyAsync(e =>
            e.TypeJournal == request.TypeJournal && e.TypeSequenceComptable == request.TypeSequenceComptable);
        if (doublon)
        {
            throw new InvalidOperationException("Un compte existe déjà pour ce type de journal et cette séquence.");
        }

        var entity = new CompteComptableJournal
        {
            TypeJournal = request.TypeJournal,
            TypeSequenceComptable = request.TypeSequenceComptable,
            CompteDebit = request.CompteDebit,
            CompteCredit = request.CompteCredit,
            SousCompte = request.SousCompte,
            Description = request.Description,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.ComptesComptableJournal.Add(entity);
        await context.SaveChangesAsync();
        return ToResponse(entity);
    }

    public async Task<CompteComptableJournalResponse> UpdateAsync(int id, CompteComptableJournalRequest request)
    {
        CompteComptableJournal? entity = await context.ComptesComptableJournal.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("CompteComptableJournal not found");
        }

        entity.TypeJournal = request.TypeJournal;
        entity.TypeSequenceComptable = request.TypeSequenceComptable;
        entity.CompteDebit = request.CompteDebit;
        entity.CompteCredit = request.CompteCredit;
        entity.SousCompte = request.SousCompte;
        entity.Description = request.Description;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return ToResponse(entity);
    }

    public async Task DeleteAsync(int id)
    {
        CompteComptableJournal? entity = await context.ComptesComptableJournal.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("CompteComptableJournal not found");
        }

        context.ComptesComptableJournal.Remove(entity);
        await context.SaveChangesAsync();
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Configuration;

namespace Design.Infrastructure.Data.Configurations;

public class CompteComptableJournalConfiguration : IEntityTypeConfiguration<CompteComptableJournal>
{
    public void Configure(EntityTypeBuilder<CompteComptableJournal> builder)
    {
        builder.ToTable("CompteComptableJournal");

        builder.Property(e => e.TypeJournal).HasMaxLength(50);
        builder.Property(e => e.TypeSequenceComptable).HasMaxLength(20);
        builder.Property(e => e.CompteDebit).HasMaxLength(20);
        builder.Property(e => e.CompteCredit).HasMaxLength(20);
        builder.Property(e => e.SousCompte).HasMaxLength(20);
        builder.Property(e => e.Description).HasMaxLength(200);

        builder.HasIndex(e => new { e.TypeJournal, e.TypeSequenceComptable }).IsUnique();

        // Valeurs de départ reprises des constantes trouvées dans JournalSqComptable.vb /
        // JournalProvisionLoyer.vb - à valider avec la comptabilité avant tout envoi réel.
        builder.HasData(
            new CompteComptableJournal
            {
                Numero = 1, TypeJournal = "EmissionLoyers", TypeSequenceComptable = "ADMIS",
                CompteDebit = "348811", CompteCredit = "732110", Description = "Émission loyers - Admis"
            },
            new CompteComptableJournal
            {
                Numero = 2, TypeJournal = "EmissionLoyers", TypeSequenceComptable = "LIBRE",
                CompteDebit = "348819", CompteCredit = "743211", Description = "Émission loyers - Libre"
            },
            new CompteComptableJournal
            {
                Numero = 3, TypeJournal = "AnnulationEmissionLoyers", TypeSequenceComptable = "ADMIS",
                CompteDebit = "732110", CompteCredit = "348811", Description = "Annulation émission loyers - Admis"
            },
            new CompteComptableJournal
            {
                Numero = 4, TypeJournal = "AnnulationEmissionLoyers", TypeSequenceComptable = "LIBRE",
                CompteDebit = "743211", CompteCredit = "348819", Description = "Annulation émission loyers - Libre"
            },
            new CompteComptableJournal
            {
                Numero = 5, TypeJournal = "EmissionLoyersContentieux", TypeSequenceComptable = "ADMIS",
                CompteDebit = "639460", CompteCredit = "394800", Description = "Émission loyers contentieux - Admis"
            },
            new CompteComptableJournal
            {
                Numero = 6, TypeJournal = "EmissionLoyersContentieux", TypeSequenceComptable = "LIBRE",
                CompteDebit = "639460", CompteCredit = "394800", Description = "Émission loyers contentieux - Libre"
            },
            new CompteComptableJournal
            {
                Numero = 7, TypeJournal = "EncaissementLoyers", TypeSequenceComptable = "ADMIS",
                CompteDebit = "445210", CompteCredit = "348811", Description = "Encaissement loyers - Admis"
            },
            new CompteComptableJournal
            {
                Numero = 8, TypeJournal = "EncaissementLoyers", TypeSequenceComptable = "LIBRE",
                CompteDebit = "445210", CompteCredit = "348819", Description = "Encaissement loyers - Libre"
            },
            new CompteComptableJournal
            {
                Numero = 9, TypeJournal = "EncaissementLoyersContentieux", TypeSequenceComptable = "ADMIS",
                CompteDebit = "394800", CompteCredit = "739460", Description = "Encaissement loyers contentieux - Admis"
            },
            new CompteComptableJournal
            {
                Numero = 10, TypeJournal = "EncaissementLoyersContentieux", TypeSequenceComptable = "LIBRE",
                CompteDebit = "394800", CompteCredit = "739460", Description = "Encaissement loyers contentieux - Libre"
            }
        );
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class JournalComptableGenerationConfiguration : IEntityTypeConfiguration<JournalComptableGeneration>
{
    public void Configure(EntityTypeBuilder<JournalComptableGeneration> builder)
    {
        builder.ToTable("JournalComptableGeneration");

        builder.Property(e => e.TypeJournal).HasMaxLength(50);
        builder.Property(e => e.MontantTotal).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => new { e.Annee, e.Mois, e.TypeJournal });
    }
}

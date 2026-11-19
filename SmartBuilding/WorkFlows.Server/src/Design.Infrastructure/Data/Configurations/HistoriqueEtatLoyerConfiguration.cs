using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class HistoriqueEtatLoyerConfiguration : IEntityTypeConfiguration<HistoriqueEtatLoyer>
{
    public void Configure(EntityTypeBuilder<HistoriqueEtatLoyer> builder)
    {
        builder.ToTable("HistoriqueEtatLoyer");

        builder.Property(e => e.Immeuble).HasMaxLength(200);
        builder.Property(e => e.CodeImmeuble).HasMaxLength(50);
        builder.Property(e => e.CompteGeneral).HasMaxLength(50);
        builder.Property(e => e.NumContratLocations).HasMaxLength(50);
        builder.Property(e => e.Locataire).HasMaxLength(200);

        builder.Property(e => e.Revenu).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Encaissement).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Enc).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Autres).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Impaye).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => new { e.Annee, e.Mois });
    }
}

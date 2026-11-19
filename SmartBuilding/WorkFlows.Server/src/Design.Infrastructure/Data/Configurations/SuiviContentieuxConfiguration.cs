using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class SuiviContentieuxConfiguration : IEntityTypeConfiguration<SuiviContentieux>
{
    public void Configure(EntityTypeBuilder<SuiviContentieux> builder)
    {
        builder.ToTable("SuiviContentieux");

        builder.Property(e => e.StatutDossier).HasMaxLength(30).IsRequired();
        builder.Property(e => e.MontantEncaisse).HasColumnType("decimal(18,2)");
        builder.Property(e => e.SoldeAnneePrecedente).HasColumnType("decimal(18,2)");
        builder.Property(e => e.PieceJointe).HasMaxLength(260);

        builder.HasIndex(e => e.NoLocation);
    }
}

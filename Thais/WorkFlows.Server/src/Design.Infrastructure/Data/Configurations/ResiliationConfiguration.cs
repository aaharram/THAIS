using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class ResiliationConfiguration : IEntityTypeConfiguration<Resiliation>
{
    public void Configure(EntityTypeBuilder<Resiliation> builder)
    {
        builder.ToTable("Resiliation");
        builder.Property(e => e.TypeResiliation).HasMaxLength(30).IsRequired();
        builder.Property(e => e.OrigineResiliation).HasMaxLength(30).IsRequired();
        builder.Property(e => e.StatutValidation).HasMaxLength(30).IsRequired();

        builder.HasIndex(e => e.NoBuilding);
        builder.HasIndex(e => e.NoContrat);
    }
}

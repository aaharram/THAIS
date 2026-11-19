using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class ChargeConfiguration : IEntityTypeConfiguration<Charge>
{
    public void Configure(EntityTypeBuilder<Charge> builder)
    {
        builder.ToTable("Charge");

        builder.Property(e => e.Montant).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Realisation).HasColumnType("decimal(18,2)");
        builder.Property(e => e.CodeCharge).HasMaxLength(20);

        builder.HasIndex(e => e.NoBuilding);
        builder.HasIndex(e => new { e.NoBuilding, e.Annee });
    }
}

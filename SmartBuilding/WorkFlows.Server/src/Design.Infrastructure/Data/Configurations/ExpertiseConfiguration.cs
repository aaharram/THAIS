using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Patrimoine;

namespace Design.Infrastructure.Data.Configurations;

public class ExpertiseConfiguration : IEntityTypeConfiguration<Expertise>
{
    public void Configure(EntityTypeBuilder<Expertise> builder)
    {
        builder.ToTable("Expertise");
        builder.Property(e => e.CabinetExpert).HasMaxLength(200).IsRequired();
        builder.Property(e => e.PieceJointe).HasMaxLength(260);

        builder.Property(e => e.ValeurTerrain).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurConstruction).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurExpertiseActualiser).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => new { e.NoBuilding, e.NoLocal });
    }
}

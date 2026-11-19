using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Patrimoine;

namespace Design.Infrastructure.Data.Configurations;

public class BuildingPieceJointeConfiguration : IEntityTypeConfiguration<BuildingPieceJointe>
{
    public void Configure(EntityTypeBuilder<BuildingPieceJointe> builder)
    {
        builder.ToTable("BuildingPieceJointe");
        builder.Property(e => e.FileName).HasMaxLength(260).IsRequired();
        builder.Property(e => e.PieceJointe).HasMaxLength(260).IsRequired();
        builder.HasIndex(e => e.NoBuilding);
    }
}

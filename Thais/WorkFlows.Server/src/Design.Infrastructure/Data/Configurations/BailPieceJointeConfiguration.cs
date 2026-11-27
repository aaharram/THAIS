using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class BailPieceJointeConfiguration : IEntityTypeConfiguration<BailPieceJointe>
{
    public void Configure(EntityTypeBuilder<BailPieceJointe> builder)
    {
        builder.ToTable("BailPieceJointe");
        builder.Property(e => e.FileName).HasMaxLength(260).IsRequired();
        builder.Property(e => e.PieceJointe).HasMaxLength(260).IsRequired();
        builder.HasIndex(e => e.NoLocation);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class SuspensionConfiguration : IEntityTypeConfiguration<Suspension>
{
    public void Configure(EntityTypeBuilder<Suspension> builder)
    {
        builder.ToTable("Suspension");
        builder.Property(e => e.StatutValidation).HasMaxLength(30).IsRequired();

        builder.HasIndex(e => e.NoBuilding);
        builder.HasIndex(e => e.NoContratLocation);
    }
}

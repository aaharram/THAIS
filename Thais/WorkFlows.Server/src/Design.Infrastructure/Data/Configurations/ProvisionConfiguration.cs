using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Patrimoine;

namespace Design.Infrastructure.Data.Configurations;

public class ProvisionConfiguration : IEntityTypeConfiguration<Provision>
{
    public void Configure(EntityTypeBuilder<Provision> builder)
    {
        builder.ToTable("Provision");
        builder.Property(e => e.MontantProvision).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoBuilding);
    }
}

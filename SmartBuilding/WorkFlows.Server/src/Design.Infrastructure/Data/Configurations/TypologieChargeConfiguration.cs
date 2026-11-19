using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Configuration;

namespace Design.Infrastructure.Data.Configurations;

public class TypologieChargeConfiguration : IEntityTypeConfiguration<TypologieCharge>
{
    public void Configure(EntityTypeBuilder<TypologieCharge> builder)
    {
        builder.ToTable("TypologieCharge");
        builder.Property(e => e.Typologie).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Compte).HasMaxLength(50);
        builder.Property(e => e.Description).HasMaxLength(500);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class SyndicReunionConfiguration : IEntityTypeConfiguration<SyndicReunion>
{
    public void Configure(EntityTypeBuilder<SyndicReunion> builder)
    {
        builder.ToTable("SyndicReunion");
        builder.Property(e => e.Type).HasMaxLength(50);
        builder.Property(e => e.QuotePartAppelFonds).HasColumnType("decimal(18,2)");
        builder.Property(e => e.AppelFondsAnnuel).HasColumnType("decimal(18,2)");
        builder.Property(e => e.PjConvocation).HasMaxLength(300);
        builder.Property(e => e.PjPV).HasMaxLength(300);
        builder.Property(e => e.PjAppelFonds).HasMaxLength(300);
        builder.HasIndex(e => e.NoBuilding);
    }
}

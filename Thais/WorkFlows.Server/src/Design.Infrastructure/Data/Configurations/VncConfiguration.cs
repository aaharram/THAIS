using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Patrimoine;

namespace Design.Infrastructure.Data.Configurations;

public class VncConfiguration : IEntityTypeConfiguration<Vnc>
{
    public void Configure(EntityTypeBuilder<Vnc> builder)
    {
        builder.ToTable("VNC");
        builder.Property(e => e.MontantVNC).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoBuilding);
    }
}

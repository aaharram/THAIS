using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class RelanceConfiguration : IEntityTypeConfiguration<Relance>
{
    public void Configure(EntityTypeBuilder<Relance> builder)
    {
        builder.ToTable("Relance");

        builder.Property(e => e.TypeRelance).HasMaxLength(30).IsRequired();
        builder.Property(e => e.TypeEnvoi).HasMaxLength(20).IsRequired();

        builder.HasIndex(e => e.NoLocation);
    }
}

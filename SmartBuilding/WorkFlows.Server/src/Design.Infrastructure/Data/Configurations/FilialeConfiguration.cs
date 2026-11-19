using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Configuration;

namespace Design.Infrastructure.Data.Configurations;

public class FilialeConfiguration : IEntityTypeConfiguration<Filiale>
{
    public void Configure(EntityTypeBuilder<Filiale> builder)
    {
        builder.ToTable("Filiale");
        builder.Property(e => e.Nom).HasMaxLength(200).IsRequired();
        builder.Property(e => e.NumeroReference).HasMaxLength(100);
        builder.Property(e => e.Rib).HasMaxLength(50);
        builder.Property(e => e.ModeReglement).HasMaxLength(50);
    }
}

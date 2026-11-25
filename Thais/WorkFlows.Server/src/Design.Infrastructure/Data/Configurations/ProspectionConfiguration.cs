using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Commercialisation;

namespace Design.Infrastructure.Data.Configurations;

public class ProspectionConfiguration : IEntityTypeConfiguration<Prospection>
{
    public void Configure(EntityTypeBuilder<Prospection> builder)
    {
        builder.ToTable("Prospection");
        builder.Property(e => e.Description).HasMaxLength(150);
        builder.Property(e => e.Pv).HasMaxLength(260);
        builder.Property(e => e.AvisBPP).HasMaxLength(260);
        builder.Property(e => e.AvisDPAL).HasMaxLength(260);
        builder.Property(e => e.SupportCA).HasMaxLength(260);
        builder.Property(e => e.BusinesPlan).HasMaxLength(260);
    }
}

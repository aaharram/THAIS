using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class PaiementFactureConfiguration : IEntityTypeConfiguration<PaiementFacture>
{
    public void Configure(EntityTypeBuilder<PaiementFacture> builder)
    {
        builder.ToTable("PaiementFacture");

        builder.Property(e => e.Montant).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoPaiement);
        builder.HasIndex(e => e.NoFacture);
    }
}

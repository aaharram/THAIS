using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class PaiementConfiguration : IEntityTypeConfiguration<Paiement>
{
    public void Configure(EntityTypeBuilder<Paiement> builder)
    {
        builder.ToTable("Paiement");

        builder.Property(e => e.ModePaiement).HasMaxLength(30).IsRequired();
        builder.Property(e => e.Reference).HasMaxLength(50);
        builder.Property(e => e.NumRemiseBancaire).HasMaxLength(50);
        builder.Property(e => e.Montant).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoLocation);
    }
}

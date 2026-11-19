using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class FactureConfiguration : IEntityTypeConfiguration<Facture>
{
    public void Configure(EntityTypeBuilder<Facture> builder)
    {
        builder.ToTable("Facture");

        builder.Property(e => e.Etat).HasMaxLength(30).IsRequired();

        builder.Property(e => e.LoyerNet).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Charges).HasColumnType("decimal(18,2)");
        builder.Property(e => e.TVA).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Taxe).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Autres).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Montant).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoLocation);
        builder.HasIndex(e => new { e.NoLocation, e.Periode });
    }
}

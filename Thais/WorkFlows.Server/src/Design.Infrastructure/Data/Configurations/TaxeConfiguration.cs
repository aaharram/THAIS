using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class TaxeConfiguration : IEntityTypeConfiguration<Taxe>
{
    public void Configure(EntityTypeBuilder<Taxe> builder)
    {
        builder.ToTable("Taxe");

        builder.Property(e => e.MontantTaxe).HasColumnType("decimal(18,2)");
        builder.Property(e => e.IdFiscal).HasMaxLength(50);
        builder.Property(e => e.NoArticle).HasMaxLength(50);

        builder.HasIndex(e => e.NoBuilding);
        builder.HasIndex(e => new { e.NoBuilding, e.Annee });
    }
}

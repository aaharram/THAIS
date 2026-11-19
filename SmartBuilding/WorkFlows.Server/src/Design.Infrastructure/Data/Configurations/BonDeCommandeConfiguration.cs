using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class BonDeCommandeConfiguration : IEntityTypeConfiguration<BonDeCommande>
{
    public void Configure(EntityTypeBuilder<BonDeCommande> builder)
    {
        builder.ToTable("BonDeCommande");
        builder.Property(e => e.NumeroBonCommande).HasMaxLength(30).IsRequired();
        builder.Property(e => e.StatutApprobation).HasMaxLength(20).IsRequired();

        builder.HasIndex(e => e.NumeroBonCommande).IsUnique();
        builder.HasIndex(e => e.NoPrestataire);
    }
}

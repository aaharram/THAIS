using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class AssuranceConfiguration : IEntityTypeConfiguration<Assurance>
{
    public void Configure(EntityTypeBuilder<Assurance> builder)
    {
        builder.ToTable("Assurance");
        builder.Property(e => e.NumPolice).HasMaxLength(50);
        builder.Property(e => e.TypeCouverture).HasMaxLength(200);
        builder.Property(e => e.Montant).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Statut).HasMaxLength(20).IsRequired();
        builder.HasIndex(e => e.NoAssureur);
    }
}

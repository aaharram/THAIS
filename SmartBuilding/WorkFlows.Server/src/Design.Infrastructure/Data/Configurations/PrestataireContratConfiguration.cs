using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class PrestataireContratConfiguration : IEntityTypeConfiguration<PrestataireContrat>
{
    public void Configure(EntityTypeBuilder<PrestataireContrat> builder)
    {
        builder.ToTable("PrestataireContrat");
        builder.Property(e => e.NumeroContrat).HasMaxLength(50);
        builder.Property(e => e.Objet).HasMaxLength(300);
        builder.Property(e => e.Montant).HasColumnType("decimal(18,2)");
        builder.Property(e => e.PieceJointe).HasMaxLength(300);
        builder.HasIndex(e => e.NoPrestataire);
    }
}

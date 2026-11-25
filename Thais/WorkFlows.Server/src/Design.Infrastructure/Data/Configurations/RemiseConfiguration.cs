using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class RemiseConfiguration : IEntityTypeConfiguration<Remise>
{
    public void Configure(EntityTypeBuilder<Remise> builder)
    {
        builder.ToTable("Remise");

        builder.Property(e => e.NumRemise).HasMaxLength(50);
        builder.Property(e => e.Montant).HasColumnType("decimal(18,2)");
        builder.Property(e => e.MontantRestant).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Reference).HasMaxLength(200);

        builder.HasIndex(e => e.NumRemise);
        builder.HasIndex(e => e.Statut);
    }
}

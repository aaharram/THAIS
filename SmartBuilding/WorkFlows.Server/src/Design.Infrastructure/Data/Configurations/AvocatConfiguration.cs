using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class AvocatConfiguration : IEntityTypeConfiguration<Avocat>
{
    public void Configure(EntityTypeBuilder<Avocat> builder)
    {
        builder.ToTable("Avocat");

        builder.Property(e => e.Nom).HasMaxLength(150);
        builder.Property(e => e.Prenom).HasMaxLength(150);
        builder.Property(e => e.Cabinet).HasMaxLength(150);
        builder.Property(e => e.Contrat).HasMaxLength(150);
        builder.Property(e => e.PieceJointe).HasMaxLength(260);

        builder.HasIndex(e => e.NoContentieux);
    }
}

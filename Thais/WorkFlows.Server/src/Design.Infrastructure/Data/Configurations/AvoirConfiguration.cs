using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class AvoirConfiguration : IEntityTypeConfiguration<Avoir>
{
    public void Configure(EntityTypeBuilder<Avoir> builder)
    {
        builder.ToTable("Avoir");

        builder.Property(e => e.Montant).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoLocation);
        builder.HasIndex(e => e.NoFacture);
    }
}

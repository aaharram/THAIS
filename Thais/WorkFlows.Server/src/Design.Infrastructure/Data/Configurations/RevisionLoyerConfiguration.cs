using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class RevisionLoyerConfiguration : IEntityTypeConfiguration<RevisionLoyer>
{
    public void Configure(EntityTypeBuilder<RevisionLoyer> builder)
    {
        builder.ToTable("RevisionLoyer");

        builder.Property(e => e.AncienLoyer).HasColumnType("decimal(18,2)");
        builder.Property(e => e.NouveauLoyer).HasColumnType("decimal(18,2)");
        builder.Property(e => e.TauxRevision).HasColumnType("decimal(5,2)");
        builder.Property(e => e.Reliquat).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoLocation);
    }
}

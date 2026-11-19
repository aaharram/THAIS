using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Configuration;

namespace Design.Infrastructure.Data.Configurations;

public class TypologieImmobilisationConfiguration : IEntityTypeConfiguration<TypologieImmobilisation>
{
    public void Configure(EntityTypeBuilder<TypologieImmobilisation> builder)
    {
        builder.ToTable("TypologieImmobilisation");
        builder.Property(e => e.ImmobilisationConcernee).HasMaxLength(200).IsRequired();
        builder.Property(e => e.CompteComptable).HasMaxLength(50);
        builder.Property(e => e.CompteAmortissement).HasMaxLength(50);
        builder.Property(e => e.CompteDotation).HasMaxLength(50);
        builder.Property(e => e.Taux).HasColumnType("decimal(5,2)");
    }
}

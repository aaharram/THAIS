using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class OrdreValidationEtatLoyerConfiguration : IEntityTypeConfiguration<OrdreValidationEtatLoyer>
{
    public void Configure(EntityTypeBuilder<OrdreValidationEtatLoyer> builder)
    {
        builder.ToTable("OrdreValidationEtatLoyer");

        builder.HasIndex(e => new { e.Annee, e.Mois }).IsUnique();
    }
}

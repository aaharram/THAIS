using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Patrimoine;

namespace Design.Infrastructure.Data.Configurations;

public class CpcImmobilierConfiguration : IEntityTypeConfiguration<CpcImmobilier>
{
    public void Configure(EntityTypeBuilder<CpcImmobilier> builder)
    {
        builder.ToTable("CpcImmobilier");

        foreach (string prop in new[]
                 {
                     nameof(CpcImmobilier.RevenusImmobilierVie), nameof(CpcImmobilier.RevenusImmobilierNonVie),
                     nameof(CpcImmobilier.PlusValuesImmobilieresVie), nameof(CpcImmobilier.PlusValuesImmobilieresNonVie),
                     nameof(CpcImmobilier.ReprisesImmobilieresLoyersVie), nameof(CpcImmobilier.ReprisesImmobilieresLoyersNonVie),
                     nameof(CpcImmobilier.ChargesImmobilieresVie), nameof(CpcImmobilier.ChargesImmobilieresNonVie),
                     nameof(CpcImmobilier.MoinsValuesImmobilieresVie), nameof(CpcImmobilier.MoinsValuesImmobilieresNonVie),
                     nameof(CpcImmobilier.DotationsImmobilieresVie), nameof(CpcImmobilier.DotationsImmobilieresNonVie),
                     nameof(CpcImmobilier.ProvisionsImmobilieresVie), nameof(CpcImmobilier.ProvisionsImmobilieresNonVie)
                 })
        {
            builder.Property<decimal>(prop).HasColumnType("decimal(18,2)");
        }

        builder.HasIndex(e => new { e.NoBuilding, e.Annee }).IsUnique();
    }
}

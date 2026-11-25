using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class ReclamationConfiguration : IEntityTypeConfiguration<Reclamation>
{
    public void Configure(EntityTypeBuilder<Reclamation> builder)
    {
        builder.ToTable("Reclamation");
        builder.Property(e => e.Etat).HasMaxLength(30).IsRequired();

        builder.HasIndex(e => e.NoBuilding);
        builder.HasIndex(e => e.NoLocataire);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class SinistreConfiguration : IEntityTypeConfiguration<Sinistre>
{
    public void Configure(EntityTypeBuilder<Sinistre> builder)
    {
        builder.ToTable("Sinistre");
        builder.Property(e => e.EtapeSuivi).HasMaxLength(30).IsRequired();
        builder.Property(e => e.EstimationDegatBailleur).HasColumnType("decimal(18,2)");
        builder.Property(e => e.EstimationDegatLocataire).HasColumnType("decimal(18,2)");
        builder.Property(e => e.MontantFacture).HasColumnType("decimal(18,2)");
        builder.Property(e => e.MontantRemuneration).HasColumnType("decimal(18,2)");
        builder.Property(e => e.IdSinistre).HasMaxLength(20);

        // Longueurs alignées sur les colonnes déjà présentes en base (cf. Sinistre.cs).
        builder.Property(e => e.NoSinistre).HasMaxLength(50);
        builder.Property(e => e.AgentAyantReclame).HasMaxLength(200);
        builder.Property(e => e.CompteurFicheIntervention).HasMaxLength(100);
        builder.Property(e => e.ReferenceDossierDAG).HasMaxLength(100);
        builder.Property(e => e.ReferenceFacture).HasMaxLength(100);
        builder.Property(e => e.Site).HasMaxLength(200);
        builder.Property(e => e.MontantExpert).HasColumnType("decimal(18,2)");
        builder.Property(e => e.CheminExpertiseLocataire).HasMaxLength(500);
        builder.Property(e => e.CheminExpertiseBailleur).HasMaxLength(500);
        builder.Property(e => e.CheminPVExpertise).HasMaxLength(500);

        builder.HasIndex(e => e.NoBuilding);
        builder.HasIndex(e => e.NoAssurance);
    }
}

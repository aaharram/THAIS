using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Patrimoine;

namespace Design.Infrastructure.Data.Configurations;

public class TableauAmortissementConfiguration : IEntityTypeConfiguration<TableauAmortissement>
{
    public void Configure(EntityTypeBuilder<TableauAmortissement> builder)
    {
        builder.ToTable("TableauAmortissement");

        builder.Property(e => e.VaPrixAcquisition).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurTerrain).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurConstruction).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurAmenagement).HasColumnType("decimal(18,2)");
        builder.Property(e => e.AmortiAnterieurs).HasColumnType("decimal(18,2)");
        builder.Property(e => e.AmortiDbeneficebTaux).HasColumnType("decimal(5,2)");
        builder.Property(e => e.AmortiDbeneficebNorm).HasColumnType("decimal(18,2)");
        builder.Property(e => e.TotalAmortiAlaFin).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoBuilding);
    }
}

public class TableauAmortissementVersionConfiguration : IEntityTypeConfiguration<TableauAmortissementVersion>
{
    public void Configure(EntityTypeBuilder<TableauAmortissementVersion> builder)
    {
        builder.ToTable("TableauAmortissementVersion");
        builder.Property(e => e.AmortissementsAnterieurs).HasColumnType("decimal(18,2)");
        builder.Property(e => e.AmortissementsNormaux).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoTableauAmortissement);
    }
}

public class AmortissementValidationConfiguration : IEntityTypeConfiguration<AmortissementValidation>
{
    public void Configure(EntityTypeBuilder<AmortissementValidation> builder)
    {
        builder.ToTable("AmortissementValidation");
        builder.HasIndex(e => e.Periode).IsUnique();
    }
}

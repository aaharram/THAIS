using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class BailConfiguration : IEntityTypeConfiguration<Bail>
{
    public void Configure(EntityTypeBuilder<Bail> builder)
    {
        builder.ToTable("Location");
        builder.Property(e => e.NumContratLocations).HasMaxLength(30);
        builder.Property(e => e.Usage).HasMaxLength(150);
        builder.Property(e => e.ModeReglement).HasMaxLength(30);
        builder.Property(e => e.Etat).HasMaxLength(30).IsRequired();

        builder.Property(e => e.LoyerNet).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Charges).HasColumnType("decimal(18,2)");
        builder.Property(e => e.TVA).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Taxe).HasColumnType("decimal(18,2)");
        builder.Property(e => e.LoyerGarage).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Autres).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Montant).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Garantie).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Caution).HasColumnType("decimal(18,2)");

        builder.Property(e => e.TypeSequenceComptable).HasMaxLength(20);
        builder.Property(e => e.TauxRevisionLoyer).HasColumnType("decimal(18,4)");
        builder.Property(e => e.CautionFichier).HasMaxLength(500);
        builder.Property(e => e.Reference).HasMaxLength(100);
        builder.Property(e => e.ResteCaution).HasColumnType("decimal(18,2)");
        builder.Property(e => e.LoyersImpayes).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ArrieresAugmentation).HasColumnType("decimal(18,2)");
        builder.Property(e => e.FraisJustice).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ContratFichier).HasMaxLength(500);

        builder.HasIndex(e => e.NoBuilding);
        builder.HasIndex(e => e.NoLocal);
        builder.HasIndex(e => e.NoLocataire);
    }
}

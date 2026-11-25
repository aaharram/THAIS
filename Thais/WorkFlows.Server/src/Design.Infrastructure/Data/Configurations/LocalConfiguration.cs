using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Patrimoine;

namespace Design.Infrastructure.Data.Configurations;

public class LocalConfiguration : IEntityTypeConfiguration<Local>
{
    public void Configure(EntityTypeBuilder<Local> builder)
    {
        builder.ToTable("Local");
        builder.Property(e => e.Designation).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Responsable).HasMaxLength(200);
        builder.Property(e => e.Address1).HasMaxLength(300);
        builder.Property(e => e.TitreFoncier).HasMaxLength(100);
        builder.Property(e => e.Etage).HasMaxLength(50);
        builder.Property(e => e.Etat).HasMaxLength(20);
        builder.Property(e => e.Demande).HasMaxLength(20);
        builder.Property(e => e.Suggestion).HasMaxLength(200);

        builder.Property(e => e.Surface).HasColumnType("decimal(12,2)");
        builder.Property(e => e.Terrasse).HasColumnType("decimal(12,2)");
        builder.Property(e => e.DernierLoyer).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurEntree).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurInventaire).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurRealisation).HasColumnType("decimal(18,2)");
        builder.Property(e => e.MontantAmenagement).HasColumnType("decimal(18,2)");
        builder.Property(e => e.OffreLoyerHT).HasColumnType("decimal(18,2)");
        builder.Property(e => e.OffreCharge).HasColumnType("decimal(18,2)");
        builder.Property(e => e.TVA).HasColumnType("decimal(18,2)");
        builder.Property(e => e.OffreTSC).HasColumnType("decimal(18,2)");
        builder.Property(e => e.OffreLoyerTTC).HasColumnType("decimal(18,2)");

        builder.Property(e => e.Acquereur).HasMaxLength(200);
        builder.Property(e => e.PromesseContratVente).HasMaxLength(260);
        builder.Property(e => e.PrixCession).HasColumnType("decimal(18,2)");
        builder.Property(e => e.EncaissementRecuCession).HasColumnType("decimal(18,2)");

        builder.HasIndex(e => e.NoBuilding);
    }
}

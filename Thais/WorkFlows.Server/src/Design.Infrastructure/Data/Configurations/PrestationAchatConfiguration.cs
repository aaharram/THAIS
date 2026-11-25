using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class PrestationAchatConfiguration : IEntityTypeConfiguration<PrestationAchat>
{
    public void Configure(EntityTypeBuilder<PrestationAchat> builder)
    {
        builder.ToTable("PrestationAchat");
        builder.Property(e => e.PrixUnitaireHT).HasColumnType("decimal(18,2)");
        builder.Property(e => e.Quantite).HasColumnType("decimal(18,2)");
        builder.Property(e => e.TauxTVA).HasColumnType("decimal(5,2)");
        builder.Property(e => e.TauxAmortissement).HasColumnType("decimal(5,2)");

        builder.HasIndex(e => e.NoBonCommande);
        builder.HasIndex(e => e.NoBuilding);
    }
}

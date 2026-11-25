using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class ContentieuxHorsLocationConfiguration : IEntityTypeConfiguration<ContentieuxHorsLocation>
{
    public void Configure(EntityTypeBuilder<ContentieuxHorsLocation> builder)
    {
        builder.ToTable("ContentieuxHorsLocation");

        builder.Property(e => e.Locataire).HasMaxLength(200);
        builder.Property(e => e.CodeLocataire).HasMaxLength(50);
        builder.Property(e => e.Immeuble).HasMaxLength(200);
        builder.Property(e => e.LoyerMensuelTTC).HasColumnType("decimal(18,2)");
        builder.Property(e => e.MontantLoyerImpaye).HasColumnType("decimal(18,2)");
    }
}

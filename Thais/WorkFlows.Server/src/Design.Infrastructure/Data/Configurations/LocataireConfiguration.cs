using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class LocataireConfiguration : IEntityTypeConfiguration<Locataire>
{
    public void Configure(EntityTypeBuilder<Locataire> builder)
    {
        builder.ToTable("Locataire");
        builder.Property(e => e.Nom).HasMaxLength(200);
        builder.Property(e => e.Prenom).HasMaxLength(200);
        builder.Property(e => e.DesignationEntreprise).HasMaxLength(200);
        builder.Property(e => e.Rc).HasMaxLength(50);
        builder.Property(e => e.IdF).HasMaxLength(50);
        builder.Property(e => e.NoCIN).HasMaxLength(50);
        builder.Property(e => e.ICE).HasMaxLength(50);
        builder.Property(e => e.CodeLocataire).HasMaxLength(50);
        builder.Property(e => e.Telephone).HasMaxLength(50);
        builder.Property(e => e.Email).HasMaxLength(150);
        builder.Property(e => e.Adresse).HasMaxLength(300);
        builder.Property(e => e.PostalCode).HasMaxLength(20);
        builder.Property(e => e.AutreContactNom).HasMaxLength(200);
        builder.Property(e => e.AutreContactPrenom).HasMaxLength(200);
        builder.Property(e => e.AutreContactTelephone).HasMaxLength(50);
        builder.Property(e => e.AutreContactPoste).HasMaxLength(100);
        builder.Property(e => e.AutreContactEmail).HasMaxLength(150);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Commercialisation;

namespace Design.Infrastructure.Data.Configurations;

public class AgenceImmobiliereConfiguration : IEntityTypeConfiguration<AgenceImmobiliere>
{
    public void Configure(EntityTypeBuilder<AgenceImmobiliere> builder)
    {
        builder.ToTable("AgenceImmobiliere");
        builder.Property(e => e.RaisonSocial).HasMaxLength(150).IsRequired();
        builder.Property(e => e.Adresse).HasMaxLength(260);
        builder.Property(e => e.Email).HasMaxLength(150);
        builder.Property(e => e.Tele).HasMaxLength(30);
        builder.Property(e => e.ContactPrincipal).HasMaxLength(150);
        builder.Property(e => e.TeleContactPrincipal).HasMaxLength(30);
    }
}

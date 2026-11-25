using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Leasing;

namespace Design.Infrastructure.Data.Configurations;

public class AttestationConfiguration : IEntityTypeConfiguration<Attestation>
{
    public void Configure(EntityTypeBuilder<Attestation> builder)
    {
        builder.ToTable("TypeAttestation");
        builder.Property(e => e.TypeAttestation).HasMaxLength(60).IsRequired();

        builder.HasIndex(e => e.NoLocation);
        builder.HasIndex(e => e.NoLocataire);
    }
}

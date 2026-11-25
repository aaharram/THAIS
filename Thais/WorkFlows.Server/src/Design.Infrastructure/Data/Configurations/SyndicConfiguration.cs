using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

public class SyndicConfiguration : IEntityTypeConfiguration<Syndic>
{
    public void Configure(EntityTypeBuilder<Syndic> builder)
    {
        builder.ToTable("Syndic");
        builder.Property(e => e.Nom).HasMaxLength(150).IsRequired();
        builder.Property(e => e.IdSyndic).HasMaxLength(20);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Users;

namespace Design.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(e => e.Numero);
        builder.ToTable("User");

        builder.HasIndex(e => e.Username).IsUnique();

        builder.Property(e => e.Numero).HasColumnName("numero");
        builder.Property(e => e.Address).HasMaxLength(80).IsFixedLength();
        builder.Property(e => e.Code).HasMaxLength(10).IsFixedLength();
        builder.Property(e => e.Company).HasMaxLength(40).IsFixedLength();
        builder.Property(e => e.Email).HasMaxLength(80).IsFixedLength();
        builder.Property(e => e.Fax).HasMaxLength(20).IsFixedLength();
        builder.Property(e => e.FirstName).HasMaxLength(30).IsFixedLength();
        builder.Property(e => e.LastName).HasMaxLength(30).IsFixedLength();
        builder.Property(e => e.Name).HasMaxLength(60).IsFixedLength();
        builder.Property(e => e.NoCity).HasColumnName("noCity");
        builder.Property(e => e.Password).HasMaxLength(100).IsUnicode(false);
        builder.Property(e => e.Tel).HasMaxLength(20).IsFixedLength();
        builder.Property(e => e.UrlPicture).HasMaxLength(120).IsFixedLength();
        builder.Property(e => e.Username).HasMaxLength(50).IsUnicode(false);
        builder.Property(e => e.SalaireHoraire).HasColumnType("decimal(18,2)");
    }
}

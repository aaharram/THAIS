using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Configuration;

namespace Design.Infrastructure.Data.Configurations;

public class LookupConfiguration<T>(string tableName) : IEntityTypeConfiguration<T>
    where T : LookupEntity
{
    public virtual void Configure(EntityTypeBuilder<T> builder)
    {
        builder.ToTable(tableName);
        builder.Property(e => e.Designation).HasMaxLength(200).IsRequired();
    }
}

public class LookupWithRateConfiguration<T>(string tableName) : LookupConfiguration<T>(tableName)
    where T : LookupWithRateEntity
{
    public override void Configure(EntityTypeBuilder<T> builder)
    {
        base.Configure(builder);
        builder.Property(e => e.Taux).HasColumnType("decimal(18,2)");
    }
}

public class LookupWithFlagConfiguration<T>(string tableName) : LookupConfiguration<T>(tableName)
    where T : LookupWithFlagEntity
{
    public override void Configure(EntityTypeBuilder<T> builder)
    {
        base.Configure(builder);
        builder.Property(e => e.AccesComplet);
    }
}

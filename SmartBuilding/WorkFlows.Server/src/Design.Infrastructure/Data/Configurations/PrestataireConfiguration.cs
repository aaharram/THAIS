using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.PropertyManagement;

namespace Design.Infrastructure.Data.Configurations;

// Mappe la table "Prestataire" déjà existante en base (partagée avec le futur module
// de sélection de prestataires / appel d'offres) - colonnes et contraintes NOT NULL
// alignées sur le schéma physique réel, pas de colonne Inactif.
public class PrestataireConfiguration : IEntityTypeConfiguration<Prestataire>
{
    public void Configure(EntityTypeBuilder<Prestataire> builder)
    {
        builder.ToTable("Prestataire");
        builder.Property(e => e.Designation).HasMaxLength(200).IsRequired();
        builder.Property(e => e.Activite).IsRequired();
        builder.Property(e => e.TypePrestataire).IsRequired();
        builder.Property(e => e.Enseigne).IsRequired();
        builder.Property(e => e.Rc).IsRequired();
        builder.Property(e => e.Idf).IsRequired();
        builder.Property(e => e.Ice).IsRequired();
        builder.Property(e => e.Adresse).IsRequired();
        builder.Property(e => e.PostalCode).IsRequired();
        builder.Property(e => e.Pays).IsRequired();
        builder.Property(e => e.Notes).IsRequired();
    }
}

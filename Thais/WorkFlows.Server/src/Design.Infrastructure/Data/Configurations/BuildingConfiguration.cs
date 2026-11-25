using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Design.Domain.Entities.Patrimoine;

namespace Design.Infrastructure.Data.Configurations;

public class BuildingConfiguration : IEntityTypeConfiguration<Building>
{
    public void Configure(EntityTypeBuilder<Building> builder)
    {
        builder.ToTable("Building");
        builder.Property(e => e.CodeImmeuble).HasMaxLength(50).IsRequired();
        builder.Property(e => e.Designation).HasMaxLength(200).IsRequired();
        builder.Property(e => e.NAffectation).HasMaxLength(20).IsRequired();
        builder.Property(e => e.NoProprieteType).HasMaxLength(20).IsRequired();
        builder.Property(e => e.NoArticle).HasMaxLength(50);
        builder.Property(e => e.CompteGeneral).HasMaxLength(50);
        builder.Property(e => e.ProvenanceActif).HasMaxLength(50);
        builder.Property(e => e.Responsable).HasMaxLength(200);
        builder.Property(e => e.ContactResponsable).HasMaxLength(100);
        builder.Property(e => e.TitreFoncier).HasMaxLength(100);
        builder.Property(e => e.TypeTF).HasMaxLength(20);
        builder.Property(e => e.Address1).HasMaxLength(300);
        builder.Property(e => e.PostalCode).HasMaxLength(20);
        builder.Property(e => e.UnitCode).HasMaxLength(50);
        builder.Property(e => e.MarqueAscenseur).HasMaxLength(100);

        builder.Property(e => e.Latitude).HasColumnType("decimal(10,6)");
        builder.Property(e => e.Longitude).HasColumnType("decimal(10,6)");
        builder.Property(e => e.ValeurEntreeTerrain).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurEntreeConstruction).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurAmenagement).HasColumnType("decimal(18,2)");
        builder.Property(e => e.ValeurInventaire).HasColumnType("decimal(18,2)");
        builder.Property(e => e.SurfaceTerrain).HasColumnType("decimal(12,2)");
        builder.Property(e => e.SurfaceUtile).HasColumnType("decimal(12,2)");
        builder.Property(e => e.SurfaceEspaceVert).HasColumnType("decimal(12,2)");
        builder.Property(e => e.SurfaceParking).HasColumnType("decimal(12,2)");

        builder.Property(e => e.Proprietaire).HasMaxLength(200);
        builder.Property(e => e.ContactProprietaire).HasMaxLength(100);
        builder.Property(e => e.PjExpertiseTechnique).HasMaxLength(260);
        builder.Property(e => e.BuildingImage).HasMaxLength(260);
        builder.Property(e => e.BuildingPlan).HasMaxLength(260);
        builder.Property(e => e.BuildingPlanCadastrale).HasMaxLength(260);
        builder.Property(e => e.CertificatPropriete).HasMaxLength(260);
        builder.Property(e => e.RegInterieur).HasMaxLength(260);
        builder.Property(e => e.Certifconformite).HasMaxLength(260);
        builder.Property(e => e.ContratAcquisition).HasMaxLength(260);

        builder.Property(e => e.Acquereur).HasMaxLength(200);
        builder.Property(e => e.PromesseContratVente).HasMaxLength(260);
        builder.Property(e => e.ValeurRealisation).HasColumnType("decimal(18,2)");
        builder.Property(e => e.PrixCession).HasColumnType("decimal(18,2)");
        builder.Property(e => e.EncaissementRecuCession).HasColumnType("decimal(18,2)");

        foreach (string prop in new[]
                 {
                     nameof(Building.SuperficieRDC), nameof(Building.SuperficieSS), nameof(Building.SuperficieSP),
                     nameof(Building.Superficie1erEtage), nameof(Building.Superficie2emeEtage), nameof(Building.Superficie3emeEtage),
                     nameof(Building.Superficie4emeEtage), nameof(Building.Superficie5emeEtage), nameof(Building.Superficie6emeEtage),
                     nameof(Building.Superficie7emeEtage), nameof(Building.Superficie8emeEtage), nameof(Building.Superficie9emeEtage),
                     nameof(Building.Superficie10emeEtage), nameof(Building.Superficie11emeEtage), nameof(Building.Superficie12emeEtage),
                     nameof(Building.Superficie13emeEtage), nameof(Building.Superficie14emeEtage), nameof(Building.Superficie15emeEtage),
                     nameof(Building.Superficie16emeEtage), nameof(Building.Superficie17emeEtage), nameof(Building.Superficie18emeEtage),
                     nameof(Building.Superficie19emeEtage), nameof(Building.Superficie20emeEtage), nameof(Building.Superficie21emeEtage),
                     nameof(Building.Superficie22emeEtage), nameof(Building.Superficie23emeEtage), nameof(Building.Superficie24emeEtage),
                     nameof(Building.Superficie25emeEtage), nameof(Building.Superficie),
                     nameof(Building.FacadePrincipale), nameof(Building.FacadeArriere), nameof(Building.FacadeLateraleDroite),
                     nameof(Building.FacadeLateraleGauche), nameof(Building.FacadeEnBiais), nameof(Building.LongueurFacade)
                 })
        {
            builder.Property(typeof(decimal?), prop).HasColumnType("decimal(12,2)");
        }
    }
}

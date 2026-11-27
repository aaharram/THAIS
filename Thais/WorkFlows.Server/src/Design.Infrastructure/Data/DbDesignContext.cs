using Microsoft.EntityFrameworkCore;
using Design.Domain.Entities.Configuration;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Commercialisation;
using Design.Domain.Entities.Patrimoine;
using Design.Domain.Entities.PropertyManagement;
using Design.Domain.Entities.Users;
using Design.Domain.Entities.Users.Enums;
using Design.Infrastructure.Data.Configurations;

namespace Design.Infrastructure.Data;

public class DbDesignContext(DbContextOptions<DbDesignContext> options) : DbContext(options)
{
    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Ville> Villes { get; set; }
    public virtual DbSet<TypologieCharge> TypologiesCharge { get; set; }
    public virtual DbSet<LocalType> LocalTypes { get; set; }
    public virtual DbSet<TypeSinistre> TypeSinistres { get; set; }
    public virtual DbSet<Banque> Banques { get; set; }
    public virtual DbSet<Filiale> Filiales { get; set; }
    public virtual DbSet<ServiceProfil> ServiceProfils { get; set; }
    public virtual DbSet<Courtier> Courtiers { get; set; }
    public virtual DbSet<Assureur> Assureurs { get; set; }
    public virtual DbSet<Encaisseur> Encaisseurs { get; set; }
    public virtual DbSet<SocieteImmobiliere> SocietesImmobilieres { get; set; }
    public virtual DbSet<BuildingType> BuildingTypes { get; set; }
    public virtual DbSet<Proprietaire> Proprietaires { get; set; }
    public virtual DbSet<Pays> PaysList { get; set; }
    public virtual DbSet<TypologieImmobilisation> TypologiesImmobilisation { get; set; }
    public virtual DbSet<Periodicite> Periodicites { get; set; }
    public virtual DbSet<TypeTaxe> TypesTaxe { get; set; }

    public virtual DbSet<Building> Buildings { get; set; }
    public virtual DbSet<BuildingPieceJointe> BuildingPiecesJointes { get; set; }
    public virtual DbSet<Local> Locaux { get; set; }
    public virtual DbSet<Expertise> Expertises { get; set; }
    public virtual DbSet<TableauAmortissement> TableauxAmortissement { get; set; }
    public virtual DbSet<TableauAmortissementVersion> TableauxAmortissementVersions { get; set; }
    public virtual DbSet<AmortissementValidation> AmortissementValidations { get; set; }
    public virtual DbSet<Vnc> Vncs { get; set; }
    public virtual DbSet<Provision> Provisions { get; set; }

    public virtual DbSet<Locataire> Locataires { get; set; }
    public virtual DbSet<Bail> Baux { get; set; }
    public virtual DbSet<BailPieceJointe> BauxPiecesJointes { get; set; }
    public virtual DbSet<RevisionLoyer> RevisionsLoyer { get; set; }
    public virtual DbSet<Facture> Factures { get; set; }
    public virtual DbSet<Avoir> Avoirs { get; set; }
    public virtual DbSet<Relance> Relances { get; set; }
    public virtual DbSet<Paiement> Paiements { get; set; }
    public virtual DbSet<PaiementFacture> PaiementFactures { get; set; }
    public virtual DbSet<SuiviContentieux> SuivisContentieux { get; set; }
    public virtual DbSet<ContentieuxHorsLocation> ContentieuxHorsLocations { get; set; }
    public virtual DbSet<HistoriqueEtatLoyer> HistoriquesEtatLoyer { get; set; }
    public virtual DbSet<OrdreValidationEtatLoyer> OrdresValidationEtatLoyer { get; set; }
    public virtual DbSet<CpcImmobilier> CpcImmobiliers { get; set; }
    public virtual DbSet<CompteComptableJournal> ComptesComptableJournal { get; set; }
    public virtual DbSet<JournalComptableGeneration> JournalComptableGenerations { get; set; }
    public virtual DbSet<Avocat> Avocats { get; set; }
    public virtual DbSet<Remise> Remises { get; set; }
    public virtual DbSet<Resiliation> Resiliations { get; set; }
    public virtual DbSet<Suspension> Suspensions { get; set; }
    public virtual DbSet<Attestation> Attestations { get; set; }
    public virtual DbSet<Prospection> Prospections { get; set; }
    public virtual DbSet<AgenceImmobiliere> AgencesImmobilieres { get; set; }

    public virtual DbSet<Prestataire> Prestataires { get; set; }
    public virtual DbSet<PrestataireContrat> PrestataireContrats { get; set; }
    public virtual DbSet<Assurance> Assurances { get; set; }
    public virtual DbSet<Charge> Charges { get; set; }
    public virtual DbSet<Syndic> Syndics { get; set; }
    public virtual DbSet<Sinistre> Sinistres { get; set; }
    public virtual DbSet<BonDeCommande> BonsDeCommande { get; set; }
    public virtual DbSet<PrestationAchat> PrestationsAchat { get; set; }
    public virtual DbSet<Reclamation> Reclamations { get; set; }
    public virtual DbSet<Taxe> Taxes { get; set; }

    // Clarifié avec l'utilisateur (session Claude Code du 2026-09-01) : Syndic (Adamou,
    // registre des membres du bureau) et SyndicReunion (historique des réunions par
    // immeuble) sont deux features distinctes et complémentaires, conservées toutes les
    // deux - la tuile "Membres du syndic" pointe vers Syndic, "Gestion des syndics" vers
    // SyndicReunion.
    public virtual DbSet<SyndicReunion> SyndicReunions { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DbDesignContext).Assembly);

        modelBuilder.ApplyConfiguration(new LookupConfiguration<Ville>("Ville"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<LocalType>("LocalType"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<TypeSinistre>("TypeSinistre"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<Banque>("Banque"));
        modelBuilder.ApplyConfiguration(new LookupWithFlagConfiguration<ServiceProfil>("ServiceProfil"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<Courtier>("Courtier"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<Assureur>("Assureur"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<Encaisseur>("Encaisseur"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<SocieteImmobiliere>("SocieteImmobiliere"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<BuildingType>("BuildingType"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<Proprietaire>("Proprietaire"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<Pays>("Pays"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<Periodicite>("Periodicity"));
        modelBuilder.ApplyConfiguration(new LookupConfiguration<TypeTaxe>("TypeTaxe"));

        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ServiceProfil>().HasData(
            new ServiceProfil
            {
                Numero = DbSeedData.AdminServiceProfilId,
                AddUser = DbSeedData.AdminUserId,
                AddDate = DbSeedData.SeedTimestamp,
                ModUser = DbSeedData.AdminUserId,
                ModDate = DbSeedData.SeedTimestamp,
                Designation = "Administrateur",
                AccesComplet = true
            });

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Numero = DbSeedData.AdminUserId,
                AddUser = DbSeedData.AdminUserId,
                AddDate = DbSeedData.SeedTimestamp,
                ModUser = DbSeedData.AdminUserId,
                ModDate = DbSeedData.SeedTimestamp,
                Username = DbSeedData.AdminUsername,
                Password = DbSeedData.AdminPasswordHash,
                FirstName = "Admin",
                LastName = "User",
                Name = "Admin User",
                Company = "",
                Email = "admin@local.dev",
                Address = "",
                Code = "",
                Tel = "",
                Fax = "",
                NoCountry = 0,
                NoProvince = 0,
                NoCity = 0,
                UrlPicture = "",
                PatrimoineType = DbSeedData.AdminServiceProfilId,
                LastLogin = DbSeedData.SeedTimestamp,
                LastHit = DbSeedData.SeedTimestamp,
                NeedPasswordReset = 0,
                Statut = PorterStatus.AVAILABLE,
                Enabled = true,
                NoQuartDeTravail = 0,
                NoTempsPause = 0,
                RaisonAbsence = "",
                NoRaisonAbandon = 0
            },
            new User
            {
                Numero = DbSeedData.EmployeeUserId,
                AddUser = DbSeedData.AdminUserId,
                AddDate = DbSeedData.SeedTimestamp,
                ModUser = DbSeedData.AdminUserId,
                ModDate = DbSeedData.SeedTimestamp,
                Username = DbSeedData.EmployeeUsername,
                Password = DbSeedData.EmployeePasswordHash,
                FirstName = "Employee",
                LastName = "User",
                Name = "Employee User",
                Company = "",
                Email = "employee@local.dev",
                Address = "",
                Code = "",
                Tel = "",
                Fax = "",
                NoCountry = 0,
                NoProvince = 0,
                NoCity = 0,
                UrlPicture = "",
                LastLogin = DbSeedData.SeedTimestamp,
                LastHit = DbSeedData.SeedTimestamp,
                NeedPasswordReset = 0,
                Statut = PorterStatus.AVAILABLE,
                Enabled = true,
                NoQuartDeTravail = 0,
                NoTempsPause = 0,
                RaisonAbsence = "",
                NoRaisonAbandon = 0
            });
    }
}

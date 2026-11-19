using Microsoft.Extensions.DependencyInjection;
using Design.Application.Features;
using Design.Application.Features.Commercialisation;
using Design.Application.Features.Configuration;
using Design.Application.Features.Dashboard;
using Design.Application.Features.Leasing;
using Design.Application.Features.Patrimoine;
using Design.Application.Features.PropertyManagement;
using Design.Application.Features.Users;
using Design.Application.Interfaces;
using Design.Application.Interfaces.Commercialisation;
using Design.Application.Interfaces.Configuration;
using Design.Application.Interfaces.Dashboard;
using Design.Application.Interfaces.Leasing;
using Design.Application.Interfaces.Patrimoine;
using Design.Application.Interfaces.PropertyManagement;
using Design.Application.Interfaces.Users;
using Design.Domain.Entities.Configuration;

namespace Design.Application.Extensions;

public static class DiServicesExtensions
{
    public static IServiceCollection AddServices(this IServiceCollection services)
    {
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthService, AuthService>();

        services.AddScoped<ILookupService<Ville>, LookupService<Ville>>();
        services.AddScoped<ILookupService<LocalType>, LookupService<LocalType>>();
        services.AddScoped<ILookupService<TypeSinistre>, LookupService<TypeSinistre>>();
        services.AddScoped<ILookupService<Banque>, LookupService<Banque>>();
        services.AddScoped<ILookupService<ServiceProfil>, LookupService<ServiceProfil>>();
        services.AddScoped<ILookupService<Courtier>, LookupService<Courtier>>();
        services.AddScoped<ILookupService<Assureur>, LookupService<Assureur>>();
        services.AddScoped<ILookupService<Encaisseur>, LookupService<Encaisseur>>();
        services.AddScoped<ILookupService<SocieteImmobiliere>, LookupService<SocieteImmobiliere>>();
        services.AddScoped<ILookupService<BuildingType>, LookupService<BuildingType>>();
        services.AddScoped<ILookupService<Proprietaire>, LookupService<Proprietaire>>();
        services.AddScoped<ILookupService<Pays>, LookupService<Pays>>();
        services.AddScoped<ILookupService<Periodicite>, LookupService<Periodicite>>();
        services.AddScoped<ILookupService<TypeTaxe>, LookupService<TypeTaxe>>();

        services.AddScoped<IImportService, ImportService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IFilialeService, FilialeService>();
        services.AddScoped<ITypologieChargeService, TypologieChargeService>();
        services.AddScoped<IBuildingService, BuildingService>();
        services.AddScoped<ITaxeHabitationService, TaxeHabitationService>();
        services.AddScoped<ITypologieImmobilisationService, TypologieImmobilisationService>();
        services.AddScoped<ILocalService, LocalService>();
        services.AddScoped<IExpertiseService, ExpertiseService>();
        services.AddScoped<ITableauAmortissementService, TableauAmortissementService>();
        services.AddScoped<IVncService, VncService>();
        services.AddScoped<IProvisionService, ProvisionService>();
        services.AddScoped<ILocataireService, LocataireService>();
        services.AddScoped<IBailService, BailService>();
        services.AddScoped<IRevisionLoyerService, RevisionLoyerService>();
        services.AddScoped<IFactureService, FactureService>();
        services.AddScoped<IFacturePdfService, FacturePdfService>();
        services.AddScoped<IAvoirService, AvoirService>();
        services.AddScoped<IRelanceService, RelanceService>();
        services.AddScoped<IPaiementService, PaiementService>();
        services.AddScoped<ISuiviContentieuxService, SuiviContentieuxService>();
        services.AddScoped<IContentieuxHorsLocationService, ContentieuxHorsLocationService>();
        services.AddScoped<IEtatLoyerService, EtatLoyerService>();
        services.AddScoped<IRapportsRecouvrementService, RapportsRecouvrementService>();
        services.AddScoped<IJournalComptableService, JournalComptableService>();
        services.AddScoped<ICompteComptableJournalService, CompteComptableJournalService>();
        services.AddScoped<IEtatReglementaireService, EtatReglementaireService>();
        services.AddScoped<ICpcImmobilierService, CpcImmobilierService>();
        services.AddScoped<IAvocatService, AvocatService>();
        services.AddScoped<IRemiseService, RemiseService>();
        services.AddScoped<IResiliationService, ResiliationService>();
        services.AddScoped<ISuspensionService, SuspensionService>();
        services.AddScoped<IAttestationService, AttestationService>();
        services.AddScoped<IProspectionService, ProspectionService>();
        services.AddScoped<IAgenceImmobiliereService, AgenceImmobiliereService>();

        services.AddScoped<IPrestataireService, PrestataireService>();
        services.AddScoped<IPrestataireContratService, PrestataireContratService>();
        services.AddScoped<IAssuranceService, AssuranceService>();
        services.AddScoped<IChargeService, ChargeService>();
        services.AddScoped<ISyndicService, SyndicService>();
        services.AddScoped<ISinistreService, SinistreService>();
        services.AddScoped<IBonDeCommandeService, BonDeCommandeService>();
        services.AddScoped<IPrestationAchatService, PrestationAchatService>();
        services.AddScoped<IReclamationService, ReclamationService>();
        services.AddScoped<ITaxeService, TaxeService>();
        services.AddScoped<ISyndicReunionService, SyndicReunionService>();

        return services;
    }
}

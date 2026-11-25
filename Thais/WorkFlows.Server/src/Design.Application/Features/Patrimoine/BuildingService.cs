using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Commercialisation;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Patrimoine;

public class BuildingService(DbDesignContext context, ILogger<BuildingService> logger) : IBuildingService
{
    private async Task<BuildingResponse> ToResponseAsync(Building entity)
    {
        string? nomBuildingType = entity.NoBuildingType is null
            ? null
            : await context.BuildingTypes.Where(x => x.Numero == entity.NoBuildingType).Select(x => x.Designation).FirstOrDefaultAsync();

        string? nomEncaisseur = entity.NoEncaisseur is null
            ? null
            : await context.Encaisseurs.Where(x => x.Numero == entity.NoEncaisseur).Select(x => x.Designation).FirstOrDefaultAsync();

        string? nomProprietaire = entity.NoProprietaire is null
            ? null
            : await context.Proprietaires.Where(x => x.Numero == entity.NoProprietaire).Select(x => x.Designation).FirstOrDefaultAsync();

        string? nomCity = entity.NoCity is null
            ? null
            : await context.Villes.Where(x => x.Numero == entity.NoCity).Select(x => x.Designation).FirstOrDefaultAsync();

        string? nomCountry = entity.NoCountry is null
            ? null
            : await context.PaysList.Where(x => x.Numero == entity.NoCountry).Select(x => x.Designation).FirstOrDefaultAsync();

        string? nomAgenceImmobiliere = entity.NoAgenceImmobiliere is null
            ? null
            : await context.AgencesImmobilieres.Where(x => x.Numero == entity.NoAgenceImmobiliere).Select(x => x.RaisonSocial).FirstOrDefaultAsync();

        int nbLocaux = await context.Locaux.CountAsync(l => l.NoBuilding == entity.Numero && !l.Inactif);

        // Même règle que RMANew (ListBuilding.vb, colonne "Baux" : count(Location) WHERE
        // EtatLocation!=0) : un bail résilié y est aussi mis à inactif=1 en même temps que
        // EtatLocation=0, donc !Inactif est l'équivalent direct dans ce schéma.
        int nbBaux = await context.Baux.CountAsync(b => b.NoBuilding == entity.Numero && !b.Inactif);

        // RMANew (ListBuilding.vb, colonne "Revenu annuel") : SUM(Location.Montant) WHERE
        // inactif=0 AND EtatLocation=1 AND GenererQuittance=1 - "EtatLocation=1" ↔
        // Etat="En cours de location" dans ce schéma.
        decimal revenuAnnuel = await context.Baux
            .Where(b => b.NoBuilding == entity.Numero && !b.Inactif && b.Etat == "En cours de location" && b.GenererQuittance)
            .SumAsync(b => b.Montant ?? 0);

        // RMANew (GetFicheS, "TotalAmort") : SUM(TableauAmortissement.TotalAmortiAlaFin),
        // sans filtre Inactif.
        decimal totalAmortissement = await context.TableauxAmortissement
            .Where(t => t.NoBuilding == entity.Numero)
            .SumAsync(t => t.TotalAmortiAlaFin);

        // RMANew (GetFicheS, "ValeurExpertise"/"ValeurExperTerrain"/"ValeurExperConstruction") :
        // TOP 1 de la dernière expertise enregistrée (ORDER BY DateExpertiseActualiser DESC),
        // pas une somme sur toutes les expertises de l'actif.
        Expertise? latestExpertise = await context.Expertises
            .Where(e => e.NoBuilding == entity.Numero)
            .OrderByDescending(e => e.DateExpertiseActualiser)
            .FirstOrDefaultAsync();

        // RMANew (GetFicheS, "Bgt"/"Charges annuelles") :
        // SUM(AchatPresatation.MontantPrestation) de l'année en cours - PrestationAchat n'a
        // pas de colonne Montant stockée ici, on la recompose comme à la saisie.
        int currentYear = DateTime.UtcNow.Year;
        decimal chargesAnnuelles = await context.PrestationsAchat
            .Where(p => p.NoBuilding == entity.Numero && p.AddDate.Year == currentYear)
            .SumAsync(p => p.PrixUnitaireHT * p.Quantite);

        // RMANew (Immeuble.vb, "Bgt"/"Budget de charge") : SUM(Charge.Montant), sans
        // filtre d'année - table "Charge" (budget de charges récurrentes), différente
        // d'AchatPresatation utilisée ci-dessus pour chargesAnnuelles.
        decimal budgetCharge = await context.Charges
            .Where(c => c.NoBuilding == entity.Numero && !c.Inactif)
            .SumAsync(c => c.Montant ?? 0);

        // RMANew (DataEntryBuilding.vb, AfterGenerate, "TotalProvis") : SUM(Provision.MontantProvision).
        decimal totalProvision = await context.Provisions
            .Where(p => p.NoBuilding == entity.Numero)
            .SumAsync(p => p.MontantProvision ?? 0);

        return new BuildingResponse
        {
            Numero = entity.Numero,
            CodeImmeuble = entity.CodeImmeuble,
            Designation = entity.Designation,
            EnExploitation = entity.EnExploitation,
            NoArticle = entity.NoArticle,
            NoBuildingType = entity.NoBuildingType,
            NomBuildingType = nomBuildingType,
            CompteGeneral = entity.CompteGeneral,
            NAffectation = entity.NAffectation,
            TypeSequenceComptable = entity.TypeSequenceComptable,
            NoEncaisseur = entity.NoEncaisseur,
            NomEncaisseur = nomEncaisseur,
            ProvenanceActif = entity.ProvenanceActif,
            AjouterContrainte = entity.AjouterContrainte,
            NoProprieteType = entity.NoProprieteType,
            NoProprietaire = entity.NoProprietaire,
            NomProprietaire = nomProprietaire,
            Responsable = entity.Responsable,
            ContactResponsable = entity.ContactResponsable,
            NoProspection = entity.NoProspection,
            TitreFoncier = entity.TitreFoncier,
            TypeTF = entity.TypeTF,
            AVendre = entity.AVendre,
            Notes = entity.Notes,
            Address1 = entity.Address1,
            PostalCode = entity.PostalCode,
            NoCity = entity.NoCity,
            NomCity = nomCity,
            NoCountry = entity.NoCountry,
            NomCountry = nomCountry,
            Latitude = entity.Latitude,
            Longitude = entity.Longitude,
            ValeurEntreeTerrain = entity.ValeurEntreeTerrain,
            ValeurEntreeConstruction = entity.ValeurEntreeConstruction,
            ValeurAmenagement = entity.ValeurAmenagement,
            ValeurInventaire = entity.ValeurInventaire,
            DateAcquisition = entity.DateAcquisition,
            DateModificationValeur = entity.DateModificationValeur,
            UnitCode = entity.UnitCode,
            SurfaceTerrain = entity.SurfaceTerrain,
            SurfaceUtile = entity.SurfaceUtile,
            SurfaceEspaceVert = entity.SurfaceEspaceVert,
            SurfaceParking = entity.SurfaceParking,
            NombrePlacesParking = entity.NombrePlacesParking,
            NombreAscenseurs = entity.NombreAscenseurs,
            MarqueAscenseur = entity.MarqueAscenseur,
            NombreEtages = entity.NombreEtages,
            Accueil = entity.Accueil,
            Securite = entity.Securite,
            Revetement = entity.Revetement,
            Peinture = entity.Peinture,
            FauxPlafond = entity.FauxPlafond,
            Reseaux = entity.Reseaux,
            Climatisation = entity.Climatisation,
            Inactif = entity.Inactif,
            NbLocaux = nbLocaux,
            NbBaux = nbBaux,
            RevenuAnnuel = revenuAnnuel,
            TotalAmortissement = totalAmortissement,
            TotalProvision = totalProvision,
            DateExpertise = latestExpertise?.DateExpertiseActualiser,
            ValeurExpertiseTotal = latestExpertise?.ValeurExpertiseActualiser ?? 0,
            ValeurExpertiseTerrain = latestExpertise?.ValeurTerrain ?? 0,
            ValeurExpertiseConstruction = latestExpertise?.ValeurConstruction ?? 0,
            ChargesAnnuelles = chargesAnnuelles,
            BudgetCharge = budgetCharge,
            NoAgenceImmobiliere = entity.NoAgenceImmobiliere,
            NomAgenceImmobiliere = nomAgenceImmobiliere,
            Proprietaire = entity.Proprietaire,
            ContactProprietaire = entity.ContactProprietaire,
            StatusProspect = entity.StatusProspect,
            StatusExpertiseTechnique = entity.StatusExpertiseTechnique,
            DateExpertiseTechnique = entity.DateExpertiseTechnique,
            DateDemandeExpertiseTechnique = entity.DateDemandeExpertiseTechnique,
            PjExpertiseTechnique = entity.PjExpertiseTechnique,
            BuildingImage = entity.BuildingImage,
            BuildingPlan = entity.BuildingPlan,
            BuildingPlanCadastrale = entity.BuildingPlanCadastrale,
            CertificatPropriete = entity.CertificatPropriete,
            RegInterieur = entity.RegInterieur,
            Certifconformite = entity.Certifconformite,
            ContratAcquisition = entity.ContratAcquisition,
            SuperficieRDC = entity.SuperficieRDC,
            SuperficieSS = entity.SuperficieSS,
            SuperficieSP = entity.SuperficieSP,
            Superficie1erEtage = entity.Superficie1erEtage,
            Superficie2emeEtage = entity.Superficie2emeEtage,
            Superficie3emeEtage = entity.Superficie3emeEtage,
            Superficie4emeEtage = entity.Superficie4emeEtage,
            Superficie5emeEtage = entity.Superficie5emeEtage,
            Superficie6emeEtage = entity.Superficie6emeEtage,
            Superficie7emeEtage = entity.Superficie7emeEtage,
            Superficie8emeEtage = entity.Superficie8emeEtage,
            Superficie9emeEtage = entity.Superficie9emeEtage,
            Superficie10emeEtage = entity.Superficie10emeEtage,
            Superficie11emeEtage = entity.Superficie11emeEtage,
            Superficie12emeEtage = entity.Superficie12emeEtage,
            Superficie13emeEtage = entity.Superficie13emeEtage,
            Superficie14emeEtage = entity.Superficie14emeEtage,
            Superficie15emeEtage = entity.Superficie15emeEtage,
            Superficie16emeEtage = entity.Superficie16emeEtage,
            Superficie17emeEtage = entity.Superficie17emeEtage,
            Superficie18emeEtage = entity.Superficie18emeEtage,
            Superficie19emeEtage = entity.Superficie19emeEtage,
            Superficie20emeEtage = entity.Superficie20emeEtage,
            Superficie21emeEtage = entity.Superficie21emeEtage,
            Superficie22emeEtage = entity.Superficie22emeEtage,
            Superficie23emeEtage = entity.Superficie23emeEtage,
            Superficie24emeEtage = entity.Superficie24emeEtage,
            Superficie25emeEtage = entity.Superficie25emeEtage,
            Superficie = entity.Superficie,
            FacadePrincipale = entity.FacadePrincipale,
            FacadeArriere = entity.FacadeArriere,
            FacadeLateraleDroite = entity.FacadeLateraleDroite,
            FacadeLateraleGauche = entity.FacadeLateraleGauche,
            FacadeEnBiais = entity.FacadeEnBiais,
            LongueurFacade = entity.LongueurFacade,
            NbFacade = entity.NbFacade,
            ValeurRealisation = entity.ValeurRealisation,
            PrixCession = entity.PrixCession,
            Acquereur = entity.Acquereur,
            PromesseContratVente = entity.PromesseContratVente,
            DateSignaturePromesseVente = entity.DateSignaturePromesseVente,
            DateSignatureContratVente = entity.DateSignatureContratVente,
            DateEnregistrementContratVente = entity.DateEnregistrementContratVente,
            EncaissementRecuCession = entity.EncaissementRecuCession,
            DateReglementCession = entity.DateReglementCession,
            Vendu = entity.Vendu,
            Observation = entity.Observation,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    // Version batchée de ToResponseAsync : évite les N+1 requêtes (5 lookups + 1
    // comptage par immeuble) qui rendaient les listes/dropdowns très lentes contre
    // le serveur SQL distant (des centaines d'aller-retours réseau séquentiels).
    private async Task<List<BuildingResponse>> ToResponseListAsync(List<Building> entities)
    {
        var buildingTypeIds = entities.Where(b => b.NoBuildingType != null).Select(b => b.NoBuildingType!.Value).Distinct().ToList();
        var encaisseurIds = entities.Where(b => b.NoEncaisseur != null).Select(b => b.NoEncaisseur!.Value).Distinct().ToList();
        var proprietaireIds = entities.Where(b => b.NoProprietaire != null).Select(b => b.NoProprietaire!.Value).Distinct().ToList();
        var cityIds = entities.Where(b => b.NoCity != null).Select(b => b.NoCity!.Value).Distinct().ToList();
        var countryIds = entities.Where(b => b.NoCountry != null).Select(b => b.NoCountry!.Value).Distinct().ToList();
        var agenceIds = entities.Where(b => b.NoAgenceImmobiliere != null).Select(b => b.NoAgenceImmobiliere!.Value).Distinct().ToList();
        var buildingIds = entities.Select(b => b.Numero).ToList();

        Dictionary<int, string> buildingTypes = await context.BuildingTypes
            .Where(x => buildingTypeIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> encaisseurs = await context.Encaisseurs
            .Where(x => encaisseurIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> proprietaires = await context.Proprietaires
            .Where(x => proprietaireIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> villes = await context.Villes
            .Where(x => cityIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> paysList = await context.PaysList
            .Where(x => countryIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> agences = await context.AgencesImmobilieres
            .Where(x => agenceIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.RaisonSocial);
        Dictionary<int, int> localCounts = await context.Locaux
            .Where(l => buildingIds.Contains(l.NoBuilding) && !l.Inactif)
            .GroupBy(l => l.NoBuilding)
            .Select(g => new { NoBuilding = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.NoBuilding, x => x.Count);
        // RMANew (Immeuble.vb, liste des actifs, "surpf") : Superficie = SUM(Local.Surface) des locaux actifs de
        // l'actif, et non la colonne Building.SurfaceUtile (celle-ci reste la valeur saisie dans le formulaire).
        Dictionary<int, decimal> surfacesLocaux = await context.Locaux
            .Where(l => buildingIds.Contains(l.NoBuilding) && !l.Inactif)
            .GroupBy(l => l.NoBuilding)
            .Select(g => new { NoBuilding = g.Key, Total = g.Sum(l => l.Surface ?? 0) })
            .ToDictionaryAsync(x => x.NoBuilding, x => x.Total);
        Dictionary<int, int> bauxCounts = await context.Baux
            .Where(b => buildingIds.Contains(b.NoBuilding) && !b.Inactif)
            .GroupBy(b => b.NoBuilding)
            .Select(g => new { NoBuilding = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.NoBuilding, x => x.Count);
        Dictionary<int, decimal> revenusAnnuels = await context.Baux
            .Where(b => buildingIds.Contains(b.NoBuilding) && !b.Inactif && b.Etat == "En cours de location" && b.GenererQuittance)
            .GroupBy(b => b.NoBuilding)
            .Select(g => new { NoBuilding = g.Key, Total = g.Sum(b => b.Montant ?? 0) })
            .ToDictionaryAsync(x => x.NoBuilding, x => x.Total);
        Dictionary<int, decimal> totalAmortissements = await context.TableauxAmortissement
            .Where(t => buildingIds.Contains(t.NoBuilding))
            .GroupBy(t => t.NoBuilding)
            .Select(g => new { NoBuilding = g.Key, Total = g.Sum(t => t.TotalAmortiAlaFin) })
            .ToDictionaryAsync(x => x.NoBuilding, x => x.Total);
        int currentYear = DateTime.UtcNow.Year;
        Dictionary<int, decimal> chargesAnnuelles = await context.PrestationsAchat
            .Where(p => buildingIds.Contains(p.NoBuilding) && p.AddDate.Year == currentYear)
            .GroupBy(p => p.NoBuilding)
            .Select(g => new { NoBuilding = g.Key, Total = g.Sum(p => p.PrixUnitaireHT * p.Quantite) })
            .ToDictionaryAsync(x => x.NoBuilding, x => x.Total);
        Dictionary<int, decimal> budgetsCharge = await context.Charges
            .Where(c => buildingIds.Contains(c.NoBuilding) && !c.Inactif)
            .GroupBy(c => c.NoBuilding)
            .Select(g => new { NoBuilding = g.Key, Total = g.Sum(c => c.Montant ?? 0) })
            .ToDictionaryAsync(x => x.NoBuilding, x => x.Total);

        // RMANew (GetFicheS) : la dernière expertise par actif (TOP 1 ORDER BY
        // DateExpertiseActualiser DESC) - le regroupement "plus récent par groupe" se fait
        // en mémoire pour éviter de dépendre de la traduction EF Core d'une sous-requête
        // corrélée, le nombre d'expertises par actif restant faible.
        List<Expertise> expertises = await context.Expertises
            .Where(e => buildingIds.Contains(e.NoBuilding))
            .ToListAsync();
        Dictionary<int, Expertise> latestExpertises = expertises
            .GroupBy(e => e.NoBuilding)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(e => e.DateExpertiseActualiser).First());

        return entities.Select(entity => new BuildingResponse
        {
            Numero = entity.Numero,
            CodeImmeuble = entity.CodeImmeuble,
            Designation = entity.Designation,
            EnExploitation = entity.EnExploitation,
            NoArticle = entity.NoArticle,
            NoBuildingType = entity.NoBuildingType,
            NomBuildingType = entity.NoBuildingType is null ? null : buildingTypes.GetValueOrDefault(entity.NoBuildingType.Value),
            CompteGeneral = entity.CompteGeneral,
            NAffectation = entity.NAffectation,
            TypeSequenceComptable = entity.TypeSequenceComptable,
            NoEncaisseur = entity.NoEncaisseur,
            NomEncaisseur = entity.NoEncaisseur is null ? null : encaisseurs.GetValueOrDefault(entity.NoEncaisseur.Value),
            ProvenanceActif = entity.ProvenanceActif,
            AjouterContrainte = entity.AjouterContrainte,
            NoProprieteType = entity.NoProprieteType,
            NoProprietaire = entity.NoProprietaire,
            NomProprietaire = entity.NoProprietaire is null ? null : proprietaires.GetValueOrDefault(entity.NoProprietaire.Value),
            Responsable = entity.Responsable,
            ContactResponsable = entity.ContactResponsable,
            NoProspection = entity.NoProspection,
            TitreFoncier = entity.TitreFoncier,
            TypeTF = entity.TypeTF,
            AVendre = entity.AVendre,
            Notes = entity.Notes,
            Address1 = entity.Address1,
            PostalCode = entity.PostalCode,
            NoCity = entity.NoCity,
            NomCity = entity.NoCity is null ? null : villes.GetValueOrDefault(entity.NoCity.Value),
            NoCountry = entity.NoCountry,
            NomCountry = entity.NoCountry is null ? null : paysList.GetValueOrDefault(entity.NoCountry.Value),
            Latitude = entity.Latitude,
            Longitude = entity.Longitude,
            ValeurEntreeTerrain = entity.ValeurEntreeTerrain,
            ValeurEntreeConstruction = entity.ValeurEntreeConstruction,
            ValeurAmenagement = entity.ValeurAmenagement,
            ValeurInventaire = entity.ValeurInventaire,
            DateAcquisition = entity.DateAcquisition,
            DateModificationValeur = entity.DateModificationValeur,
            UnitCode = entity.UnitCode,
            SurfaceTerrain = entity.SurfaceTerrain,
            SurfaceUtile = surfacesLocaux.GetValueOrDefault(entity.Numero),
            SurfaceEspaceVert = entity.SurfaceEspaceVert,
            SurfaceParking = entity.SurfaceParking,
            NombrePlacesParking = entity.NombrePlacesParking,
            NombreAscenseurs = entity.NombreAscenseurs,
            MarqueAscenseur = entity.MarqueAscenseur,
            NombreEtages = entity.NombreEtages,
            Accueil = entity.Accueil,
            Securite = entity.Securite,
            Revetement = entity.Revetement,
            Peinture = entity.Peinture,
            FauxPlafond = entity.FauxPlafond,
            Reseaux = entity.Reseaux,
            Climatisation = entity.Climatisation,
            Inactif = entity.Inactif,
            NbLocaux = localCounts.GetValueOrDefault(entity.Numero),
            NbBaux = bauxCounts.GetValueOrDefault(entity.Numero),
            RevenuAnnuel = revenusAnnuels.GetValueOrDefault(entity.Numero),
            TotalAmortissement = totalAmortissements.GetValueOrDefault(entity.Numero),
            ValeurExpertiseTotal = latestExpertises.GetValueOrDefault(entity.Numero)?.ValeurExpertiseActualiser ?? 0,
            ValeurExpertiseTerrain = latestExpertises.GetValueOrDefault(entity.Numero)?.ValeurTerrain ?? 0,
            ValeurExpertiseConstruction = latestExpertises.GetValueOrDefault(entity.Numero)?.ValeurConstruction ?? 0,
            ChargesAnnuelles = chargesAnnuelles.GetValueOrDefault(entity.Numero),
            BudgetCharge = budgetsCharge.GetValueOrDefault(entity.Numero),
            NoAgenceImmobiliere = entity.NoAgenceImmobiliere,
            NomAgenceImmobiliere = entity.NoAgenceImmobiliere is null ? null : agences.GetValueOrDefault(entity.NoAgenceImmobiliere.Value),
            Proprietaire = entity.Proprietaire,
            ContactProprietaire = entity.ContactProprietaire,
            StatusProspect = entity.StatusProspect,
            StatusExpertiseTechnique = entity.StatusExpertiseTechnique,
            DateExpertiseTechnique = entity.DateExpertiseTechnique,
            DateDemandeExpertiseTechnique = entity.DateDemandeExpertiseTechnique,
            PjExpertiseTechnique = entity.PjExpertiseTechnique,
            BuildingImage = entity.BuildingImage,
            BuildingPlan = entity.BuildingPlan,
            BuildingPlanCadastrale = entity.BuildingPlanCadastrale,
            CertificatPropriete = entity.CertificatPropriete,
            RegInterieur = entity.RegInterieur,
            Certifconformite = entity.Certifconformite,
            ContratAcquisition = entity.ContratAcquisition,
            SuperficieRDC = entity.SuperficieRDC,
            SuperficieSS = entity.SuperficieSS,
            SuperficieSP = entity.SuperficieSP,
            Superficie1erEtage = entity.Superficie1erEtage,
            Superficie2emeEtage = entity.Superficie2emeEtage,
            Superficie3emeEtage = entity.Superficie3emeEtage,
            Superficie4emeEtage = entity.Superficie4emeEtage,
            Superficie5emeEtage = entity.Superficie5emeEtage,
            Superficie6emeEtage = entity.Superficie6emeEtage,
            Superficie7emeEtage = entity.Superficie7emeEtage,
            Superficie8emeEtage = entity.Superficie8emeEtage,
            Superficie9emeEtage = entity.Superficie9emeEtage,
            Superficie10emeEtage = entity.Superficie10emeEtage,
            Superficie11emeEtage = entity.Superficie11emeEtage,
            Superficie12emeEtage = entity.Superficie12emeEtage,
            Superficie13emeEtage = entity.Superficie13emeEtage,
            Superficie14emeEtage = entity.Superficie14emeEtage,
            Superficie15emeEtage = entity.Superficie15emeEtage,
            Superficie16emeEtage = entity.Superficie16emeEtage,
            Superficie17emeEtage = entity.Superficie17emeEtage,
            Superficie18emeEtage = entity.Superficie18emeEtage,
            Superficie19emeEtage = entity.Superficie19emeEtage,
            Superficie20emeEtage = entity.Superficie20emeEtage,
            Superficie21emeEtage = entity.Superficie21emeEtage,
            Superficie22emeEtage = entity.Superficie22emeEtage,
            Superficie23emeEtage = entity.Superficie23emeEtage,
            Superficie24emeEtage = entity.Superficie24emeEtage,
            Superficie25emeEtage = entity.Superficie25emeEtage,
            Superficie = entity.Superficie,
            FacadePrincipale = entity.FacadePrincipale,
            FacadeArriere = entity.FacadeArriere,
            FacadeLateraleDroite = entity.FacadeLateraleDroite,
            FacadeLateraleGauche = entity.FacadeLateraleGauche,
            FacadeEnBiais = entity.FacadeEnBiais,
            LongueurFacade = entity.LongueurFacade,
            NbFacade = entity.NbFacade,
            ValeurRealisation = entity.ValeurRealisation,
            PrixCession = entity.PrixCession,
            Acquereur = entity.Acquereur,
            PromesseContratVente = entity.PromesseContratVente,
            DateSignaturePromesseVente = entity.DateSignaturePromesseVente,
            DateSignatureContratVente = entity.DateSignatureContratVente,
            DateEnregistrementContratVente = entity.DateEnregistrementContratVente,
            EncaissementRecuCession = entity.EncaissementRecuCession,
            DateReglementCession = entity.DateReglementCession,
            Vendu = entity.Vendu,
            Observation = entity.Observation,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        }).ToList();
    }

    private static decimal? ComputeValeurInventaire(BuildingRequest request)
    {
        decimal terrain = request.ValeurEntreeTerrain ?? 0;
        decimal construction = request.ValeurEntreeConstruction ?? 0;
        decimal amenagement = request.ValeurAmenagement ?? 0;
        decimal total = terrain + construction + amenagement;
        return total == 0 ? null : total;
    }

    // Même logique que RMANew (LXSuperficie, readonly) : la superficie globale d'un
    // Bien est la somme de RDC + sous-sol + mezzanine + tous les étages saisis.
    private static decimal? ComputeSuperficie(BuildingRequest request)
    {
        decimal total = (request.SuperficieRDC ?? 0) + (request.SuperficieSS ?? 0) + (request.SuperficieSP ?? 0) +
                         (request.Superficie1erEtage ?? 0) + (request.Superficie2emeEtage ?? 0) + (request.Superficie3emeEtage ?? 0) +
                         (request.Superficie4emeEtage ?? 0) + (request.Superficie5emeEtage ?? 0) + (request.Superficie6emeEtage ?? 0) +
                         (request.Superficie7emeEtage ?? 0) + (request.Superficie8emeEtage ?? 0) + (request.Superficie9emeEtage ?? 0) +
                         (request.Superficie10emeEtage ?? 0) + (request.Superficie11emeEtage ?? 0) + (request.Superficie12emeEtage ?? 0) +
                         (request.Superficie13emeEtage ?? 0) + (request.Superficie14emeEtage ?? 0) + (request.Superficie15emeEtage ?? 0) +
                         (request.Superficie16emeEtage ?? 0) + (request.Superficie17emeEtage ?? 0) + (request.Superficie18emeEtage ?? 0) +
                         (request.Superficie19emeEtage ?? 0) + (request.Superficie20emeEtage ?? 0) + (request.Superficie21emeEtage ?? 0) +
                         (request.Superficie22emeEtage ?? 0) + (request.Superficie23emeEtage ?? 0) + (request.Superficie24emeEtage ?? 0) +
                         (request.Superficie25emeEtage ?? 0);
        return total == 0 ? null : total;
    }

    // Même logique que RMANew (LXLongueurFacade, readonly) : somme des 5 façades.
    private static decimal? ComputeLongueurFacade(BuildingRequest request)
    {
        decimal total = (request.FacadePrincipale ?? 0) + (request.FacadeArriere ?? 0) + (request.FacadeLateraleDroite ?? 0) +
                         (request.FacadeLateraleGauche ?? 0) + (request.FacadeEnBiais ?? 0);
        return total == 0 ? null : total;
    }

    public Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request) =>
        GetPagedAsync(request, inactif: false);

    // Archives (RMANew ListArchivesImmeubles.aspx) : même liste, mais Building.inactif=1.
    public Task<PagedResult<object>> GetArchivedAsync(GetFilterSearchSortRequest request) =>
        GetPagedAsync(request, inactif: true);

    private async Task<PagedResult<object>> GetPagedAsync(GetFilterSearchSortRequest request, bool inactif)
    {
        try
        {
            if (request.PageNumber < 1)
            {
                request.PageNumber = 1;
            }

            if (request.PageSize is < 1 or > 100)
            {
                request.PageSize = 10;
            }

            IQueryable<Building> query = context.Buildings.Where(b => b.Inactif == inactif);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                query = query.Where(e =>
                    e.Designation.ToLower().Contains(search) || e.CodeImmeuble.ToLower().Contains(search));
            }

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderBy(e => e.Designation);

            int totalCount = await query.CountAsync();

            List<Building> items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            List<BuildingResponse> mapped = await ToResponseListAsync(items);

            return new PagedResult<object>
            {
                Items = mapped.Cast<object>().ToList(),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }
        catch (Exception ex)
        {
            logger.LogError("Error fetching Buildings: {ExMessage}", ex.Message);
            throw;
        }
    }

    // Archives : réactiver un actif désactivé (RMANew ListArchivesImmeubles.ActiveBuilding).
    public async Task<BuildingResponse> ReactivateAsync(int id)
    {
        Building? entity = await context.Buildings.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Building not found");
        }

        entity.Inactif = false;
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        logger.LogInformation("Building with ID {Id} reactivated successfully.", id);

        return await ToResponseAsync(entity);
    }

    // RMANew (Classes/Carte.vb, GetImmeubles) : buildings avec des coordonnées GPS
    // renseignées, pour la carte Géolocalisation - filtrés par Réseau (Propriétaire) et/ou
    // Destinations (BuildingType) si fournis, comme les 7 branches if/elseif de RMANew
    // (ici condensées puisque les deux filtres sont indépendants).
    public async Task<List<BuildingMapMarkerResponse>> GetMapMarkersAsync(int? noProprietaire, int? noBuildingType)
    {
        // Bornes géographiques larges du Maroc (avec marge) : certaines fiches de données
        // de test/seed portent des coordonnées GPS aberrantes (ex: près du pôle Nord) qui
        // n'ont pas de sens pour un actif RMA - les inclure dans fitBounds() côté client
        // forcerait la carte à dézoomer jusqu'à ces points au lieu de rester cadrée sur le
        // Maroc. RMANew n'a pas ce problème car sa base de production ne contient pas ce
        // genre de données de test.
        IQueryable<Building> query = context.Buildings
            .Where(b => !b.Inactif && b.Latitude != null && b.Longitude != null && b.Latitude != 0 && b.Longitude != 0
                && b.Latitude >= 20 && b.Latitude <= 37 && b.Longitude >= -18 && b.Longitude <= 0);

        if (noProprietaire is > 0)
        {
            query = query.Where(b => b.NoProprietaire == noProprietaire);
        }

        if (noBuildingType is > 0)
        {
            query = query.Where(b => b.NoBuildingType == noBuildingType);
        }

        List<Building> buildings = await query.OrderBy(b => b.Designation).ToListAsync();

        var buildingTypeIds = buildings.Where(b => b.NoBuildingType != null).Select(b => b.NoBuildingType!.Value).Distinct().ToList();
        var cityIds = buildings.Where(b => b.NoCity != null).Select(b => b.NoCity!.Value).Distinct().ToList();

        Dictionary<int, string> buildingTypes = await context.BuildingTypes
            .Where(x => buildingTypeIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> villes = await context.Villes
            .Where(x => cityIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);

        return buildings.Select(b => new BuildingMapMarkerResponse
        {
            Numero = b.Numero,
            Designation = b.Designation,
            Address1 = b.Address1,
            NomBuildingType = b.NoBuildingType is null ? null : buildingTypes.GetValueOrDefault(b.NoBuildingType.Value),
            NomCity = b.NoCity is null ? null : villes.GetValueOrDefault(b.NoCity.Value),
            Latitude = b.Latitude!.Value,
            Longitude = b.Longitude!.Value,
        }).ToList();
    }

    public async Task<BuildingResponse> GetByIdAsync(int id)
    {
        Building? entity = await context.Buildings.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Building not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<BuildingResponse> CreateAsync(BuildingRequest request)
    {
        var entity = new Building
        {
            CodeImmeuble = request.CodeImmeuble.Trim(),
            Designation = request.Designation.Trim(),
            EnExploitation = request.EnExploitation,
            NoArticle = request.NoArticle,
            NoBuildingType = request.NoBuildingType,
            CompteGeneral = request.CompteGeneral,
            NAffectation = request.NAffectation,
            TypeSequenceComptable = request.TypeSequenceComptable,
            NoEncaisseur = request.NoEncaisseur,
            ProvenanceActif = request.ProvenanceActif,
            AjouterContrainte = request.AjouterContrainte,
            NoProprieteType = request.NoProprieteType,
            NoProprietaire = request.NoProprietaire,
            Responsable = request.Responsable,
            ContactResponsable = request.ContactResponsable,
            NoProspection = request.NoProspection,
            TitreFoncier = request.TitreFoncier,
            TypeTF = request.TypeTF,
            AVendre = request.AVendre,
            Notes = request.Notes,
            Address1 = request.Address1,
            PostalCode = request.PostalCode,
            NoCity = request.NoCity,
            NoCountry = request.NoCountry,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            ValeurEntreeTerrain = request.ValeurEntreeTerrain,
            ValeurEntreeConstruction = request.ValeurEntreeConstruction,
            ValeurAmenagement = request.ValeurAmenagement,
            ValeurInventaire = ComputeValeurInventaire(request),
            DateAcquisition = request.DateAcquisition,
            DateModificationValeur = request.DateModificationValeur,
            UnitCode = request.UnitCode,
            SurfaceTerrain = request.SurfaceTerrain,
            SurfaceUtile = request.SurfaceUtile,
            SurfaceEspaceVert = request.SurfaceEspaceVert,
            SurfaceParking = request.SurfaceParking,
            NombrePlacesParking = request.NombrePlacesParking,
            NombreAscenseurs = request.NombreAscenseurs,
            MarqueAscenseur = request.MarqueAscenseur,
            NombreEtages = request.NombreEtages,
            Accueil = request.Accueil,
            Securite = request.Securite,
            Revetement = request.Revetement,
            Peinture = request.Peinture,
            FauxPlafond = request.FauxPlafond,
            Reseaux = request.Reseaux,
            Climatisation = request.Climatisation,
            Inactif = request.Inactif,
            NoAgenceImmobiliere = request.NoAgenceImmobiliere,
            Proprietaire = request.Proprietaire,
            ContactProprietaire = request.ContactProprietaire,
            StatusProspect = request.StatusProspect,
            StatusExpertiseTechnique = request.StatusExpertiseTechnique,
            DateExpertiseTechnique = request.DateExpertiseTechnique,
            DateDemandeExpertiseTechnique = request.DateDemandeExpertiseTechnique,
            PjExpertiseTechnique = request.PjExpertiseTechnique,
            BuildingImage = request.BuildingImage,
            BuildingPlan = request.BuildingPlan,
            BuildingPlanCadastrale = request.BuildingPlanCadastrale,
            CertificatPropriete = request.CertificatPropriete,
            RegInterieur = request.RegInterieur,
            Certifconformite = request.Certifconformite,
            ContratAcquisition = request.ContratAcquisition,
            SuperficieRDC = request.SuperficieRDC,
            SuperficieSS = request.SuperficieSS,
            SuperficieSP = request.SuperficieSP,
            Superficie1erEtage = request.Superficie1erEtage,
            Superficie2emeEtage = request.Superficie2emeEtage,
            Superficie3emeEtage = request.Superficie3emeEtage,
            Superficie4emeEtage = request.Superficie4emeEtage,
            Superficie5emeEtage = request.Superficie5emeEtage,
            Superficie6emeEtage = request.Superficie6emeEtage,
            Superficie7emeEtage = request.Superficie7emeEtage,
            Superficie8emeEtage = request.Superficie8emeEtage,
            Superficie9emeEtage = request.Superficie9emeEtage,
            Superficie10emeEtage = request.Superficie10emeEtage,
            Superficie11emeEtage = request.Superficie11emeEtage,
            Superficie12emeEtage = request.Superficie12emeEtage,
            Superficie13emeEtage = request.Superficie13emeEtage,
            Superficie14emeEtage = request.Superficie14emeEtage,
            Superficie15emeEtage = request.Superficie15emeEtage,
            Superficie16emeEtage = request.Superficie16emeEtage,
            Superficie17emeEtage = request.Superficie17emeEtage,
            Superficie18emeEtage = request.Superficie18emeEtage,
            Superficie19emeEtage = request.Superficie19emeEtage,
            Superficie20emeEtage = request.Superficie20emeEtage,
            Superficie21emeEtage = request.Superficie21emeEtage,
            Superficie22emeEtage = request.Superficie22emeEtage,
            Superficie23emeEtage = request.Superficie23emeEtage,
            Superficie24emeEtage = request.Superficie24emeEtage,
            Superficie25emeEtage = request.Superficie25emeEtage,
            Superficie = ComputeSuperficie(request),
            FacadePrincipale = request.FacadePrincipale,
            FacadeArriere = request.FacadeArriere,
            FacadeLateraleDroite = request.FacadeLateraleDroite,
            FacadeLateraleGauche = request.FacadeLateraleGauche,
            FacadeEnBiais = request.FacadeEnBiais,
            LongueurFacade = ComputeLongueurFacade(request),
            NbFacade = request.NbFacade,
            ValeurRealisation = request.ValeurRealisation,
            PrixCession = request.PrixCession,
            Acquereur = request.Acquereur,
            PromesseContratVente = request.PromesseContratVente,
            DateSignaturePromesseVente = request.DateSignaturePromesseVente,
            DateSignatureContratVente = request.DateSignatureContratVente,
            DateEnregistrementContratVente = request.DateEnregistrementContratVente,
            EncaissementRecuCession = request.EncaissementRecuCession,
            DateReglementCession = request.DateReglementCession,
            Vendu = request.Vendu,
            Observation = request.Observation,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Buildings.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("Building with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<BuildingResponse> UpdateAsync(int id, BuildingRequest request)
    {
        Building? entity = await context.Buildings.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("Building not found");
        }

        entity.CodeImmeuble = request.CodeImmeuble.Trim();
        entity.Designation = request.Designation.Trim();
        entity.EnExploitation = request.EnExploitation;
        entity.NoArticle = request.NoArticle;
        entity.NoBuildingType = request.NoBuildingType;
        entity.CompteGeneral = request.CompteGeneral;
        entity.NAffectation = request.NAffectation;
        entity.TypeSequenceComptable = request.TypeSequenceComptable;
        entity.NoEncaisseur = request.NoEncaisseur;
        entity.ProvenanceActif = request.ProvenanceActif;
        entity.AjouterContrainte = request.AjouterContrainte;
        entity.NoProprieteType = request.NoProprieteType;
        entity.NoProprietaire = request.NoProprietaire;
        entity.Responsable = request.Responsable;
        entity.ContactResponsable = request.ContactResponsable;
        entity.NoProspection = request.NoProspection;
        entity.TitreFoncier = request.TitreFoncier;
        entity.TypeTF = request.TypeTF;
        entity.AVendre = request.AVendre;
        entity.Notes = request.Notes;
        entity.Address1 = request.Address1;
        entity.PostalCode = request.PostalCode;
        entity.NoCity = request.NoCity;
        entity.NoCountry = request.NoCountry;
        entity.Latitude = request.Latitude;
        entity.Longitude = request.Longitude;
        entity.ValeurEntreeTerrain = request.ValeurEntreeTerrain;
        entity.ValeurEntreeConstruction = request.ValeurEntreeConstruction;
        entity.ValeurAmenagement = request.ValeurAmenagement;
        entity.ValeurInventaire = ComputeValeurInventaire(request);
        entity.DateAcquisition = request.DateAcquisition;
        entity.DateModificationValeur = request.DateModificationValeur;
        entity.UnitCode = request.UnitCode;
        entity.SurfaceTerrain = request.SurfaceTerrain;
        entity.SurfaceUtile = request.SurfaceUtile;
        entity.SurfaceEspaceVert = request.SurfaceEspaceVert;
        entity.SurfaceParking = request.SurfaceParking;
        entity.NombrePlacesParking = request.NombrePlacesParking;
        entity.NombreAscenseurs = request.NombreAscenseurs;
        entity.MarqueAscenseur = request.MarqueAscenseur;
        entity.NombreEtages = request.NombreEtages;
        entity.Accueil = request.Accueil;
        entity.Securite = request.Securite;
        entity.Revetement = request.Revetement;
        entity.Peinture = request.Peinture;
        entity.FauxPlafond = request.FauxPlafond;
        entity.Reseaux = request.Reseaux;
        entity.Climatisation = request.Climatisation;
        entity.Inactif = request.Inactif;
        entity.NoAgenceImmobiliere = request.NoAgenceImmobiliere;
        entity.Proprietaire = request.Proprietaire;
        entity.ContactProprietaire = request.ContactProprietaire;
        entity.StatusProspect = request.StatusProspect;
        entity.StatusExpertiseTechnique = request.StatusExpertiseTechnique;
        entity.DateExpertiseTechnique = request.DateExpertiseTechnique;
        entity.DateDemandeExpertiseTechnique = request.DateDemandeExpertiseTechnique;
        entity.PjExpertiseTechnique = request.PjExpertiseTechnique;
        entity.BuildingImage = request.BuildingImage;
        entity.BuildingPlan = request.BuildingPlan;
        entity.BuildingPlanCadastrale = request.BuildingPlanCadastrale;
        entity.CertificatPropriete = request.CertificatPropriete;
        entity.RegInterieur = request.RegInterieur;
        entity.Certifconformite = request.Certifconformite;
        entity.ContratAcquisition = request.ContratAcquisition;
        entity.SuperficieRDC = request.SuperficieRDC;
        entity.SuperficieSS = request.SuperficieSS;
        entity.SuperficieSP = request.SuperficieSP;
        entity.Superficie1erEtage = request.Superficie1erEtage;
        entity.Superficie2emeEtage = request.Superficie2emeEtage;
        entity.Superficie3emeEtage = request.Superficie3emeEtage;
        entity.Superficie4emeEtage = request.Superficie4emeEtage;
        entity.Superficie5emeEtage = request.Superficie5emeEtage;
        entity.Superficie6emeEtage = request.Superficie6emeEtage;
        entity.Superficie7emeEtage = request.Superficie7emeEtage;
        entity.Superficie8emeEtage = request.Superficie8emeEtage;
        entity.Superficie9emeEtage = request.Superficie9emeEtage;
        entity.Superficie10emeEtage = request.Superficie10emeEtage;
        entity.Superficie11emeEtage = request.Superficie11emeEtage;
        entity.Superficie12emeEtage = request.Superficie12emeEtage;
        entity.Superficie13emeEtage = request.Superficie13emeEtage;
        entity.Superficie14emeEtage = request.Superficie14emeEtage;
        entity.Superficie15emeEtage = request.Superficie15emeEtage;
        entity.Superficie16emeEtage = request.Superficie16emeEtage;
        entity.Superficie17emeEtage = request.Superficie17emeEtage;
        entity.Superficie18emeEtage = request.Superficie18emeEtage;
        entity.Superficie19emeEtage = request.Superficie19emeEtage;
        entity.Superficie20emeEtage = request.Superficie20emeEtage;
        entity.Superficie21emeEtage = request.Superficie21emeEtage;
        entity.Superficie22emeEtage = request.Superficie22emeEtage;
        entity.Superficie23emeEtage = request.Superficie23emeEtage;
        entity.Superficie24emeEtage = request.Superficie24emeEtage;
        entity.Superficie25emeEtage = request.Superficie25emeEtage;
        entity.Superficie = ComputeSuperficie(request);
        entity.FacadePrincipale = request.FacadePrincipale;
        entity.FacadeArriere = request.FacadeArriere;
        entity.FacadeLateraleDroite = request.FacadeLateraleDroite;
        entity.FacadeLateraleGauche = request.FacadeLateraleGauche;
        entity.FacadeEnBiais = request.FacadeEnBiais;
        entity.LongueurFacade = ComputeLongueurFacade(request);
        entity.NbFacade = request.NbFacade;
        entity.ValeurRealisation = request.ValeurRealisation;
        entity.PrixCession = request.PrixCession;
        entity.Acquereur = request.Acquereur;
        entity.PromesseContratVente = request.PromesseContratVente;
        entity.DateSignaturePromesseVente = request.DateSignaturePromesseVente;
        entity.DateSignatureContratVente = request.DateSignatureContratVente;
        entity.DateEnregistrementContratVente = request.DateEnregistrementContratVente;
        entity.EncaissementRecuCession = request.EncaissementRecuCession;
        entity.DateReglementCession = request.DateReglementCession;
        entity.Vendu = request.Vendu;
        entity.Observation = request.Observation;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Building with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Building? entity = await context.Buildings.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        // Suppression logique (comme RMANew : inactif=1), pas de suppression physique.
        entity.Inactif = true;
        entity.ModDate = DateTime.UtcNow;

        // Règle métier RMANew (DataEntryBiens.vb Deactiver()) : désactiver un actif désactive
        // en cascade ses Locaux et ses Baux.
        await context.Locaux.Where(l => l.NoBuilding == id)
            .ExecuteUpdateAsync(s => s.SetProperty(l => l.Inactif, true));
        await context.Baux.Where(b => b.NoBuilding == id)
            .ExecuteUpdateAsync(s => s.SetProperty(b => b.Inactif, true));

        int result = await context.SaveChangesAsync();

        logger.LogInformation("Building with ID {Id} deactivated successfully (cascade Locaux/Baux).", id);

        return result;
    }

    // RMANew (DataEntryBuilding.vb, "Complètement Pièces jointes", table BuildingPieceJointe).
    public async Task<List<BuildingPieceJointeResponse>> GetPiecesJointesAsync(int buildingId)
    {
        return await context.BuildingPiecesJointes
            .Where(x => x.NoBuilding == buildingId)
            .OrderBy(x => x.Numero)
            .Select(x => new BuildingPieceJointeResponse
            {
                Numero = x.Numero,
                NoBuilding = x.NoBuilding,
                FileName = x.FileName,
                PieceJointe = x.PieceJointe,
                Taille = x.Taille,
                AddDate = x.AddDate
            })
            .ToListAsync();
    }

    public async Task<BuildingPieceJointeResponse> AddPieceJointeAsync(int buildingId, BuildingPieceJointeRequest request)
    {
        if (!await context.Buildings.AnyAsync(b => b.Numero == buildingId))
        {
            throw new KeyNotFoundException("Building not found");
        }

        int user = request.AddUser ?? 0;
        var entity = new BuildingPieceJointe
        {
            NoBuilding = buildingId,
            FileName = request.FileName.Trim(),
            PieceJointe = request.PieceJointe,
            Taille = request.Taille,
            AddUser = user,
            AddDate = DateTime.UtcNow,
            ModUser = user,
            ModDate = DateTime.UtcNow
        };

        context.BuildingPiecesJointes.Add(entity);
        await context.SaveChangesAsync();

        return new BuildingPieceJointeResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            FileName = entity.FileName,
            PieceJointe = entity.PieceJointe,
            Taille = entity.Taille,
            AddDate = entity.AddDate
        };
    }

    public async Task<int> DeletePieceJointeAsync(int buildingId, int pieceJointeId)
    {
        BuildingPieceJointe? entity = await context.BuildingPiecesJointes
            .FirstOrDefaultAsync(x => x.Numero == pieceJointeId && x.NoBuilding == buildingId);
        if (entity == null)
        {
            return 0;
        }

        context.BuildingPiecesJointes.Remove(entity);
        return await context.SaveChangesAsync();
    }

    // RMANew (DataEntryBuilding.vb, BeforeGenerate, "Immobilisation en cours") : prestations
    // amorties dont le compte comptable du bon de commande commence par « 2 ».
    // « Total Amorti » : RMANew le lisait dans TableauAmortissement via le libellé de la charge ;
    // ici l'action « Amortir » d'une prestation ne crée pas encore de ligne d'amortissement
    // (voir PrestationAchatService.AmortirAsync), il n'y a donc rien à sommer : 0.
    public async Task<List<ImmobilisationEnCoursResponse>> GetImmobilisationsEnCoursAsync(int buildingId)
    {
        var rows = await (
            from p in context.PrestationsAchat
            join b in context.BonsDeCommande on p.NoBonCommande equals b.Numero
            join t in context.TypologiesCharge on p.NoTypologieCharge equals t.Numero into typologies
            from t in typologies.DefaultIfEmpty()
            where p.NoBuilding == buildingId
                  && p.EstAmorti
                  && b.CompteComptable != null
                  && b.CompteComptable.StartsWith("2")
            orderby b.DateCommande
            select new
            {
                p.Numero,
                Prestation = t != null ? t.Typologie : "",
                b.DateCommande,
                p.PrixUnitaireHT,
                p.Quantite,
                p.TauxTVA
            }).ToListAsync();

        return rows.Select(r =>
        {
            decimal montantHt = r.PrixUnitaireHT * r.Quantite;
            return new ImmobilisationEnCoursResponse
            {
                Numero = r.Numero,
                Prestation = r.Prestation,
                DateDebut = r.DateCommande,
                ValeurEntree = montantHt + (montantHt * (r.TauxTVA ?? 0)) / 100,
                TotalAmorti = 0
            };
        }).ToList();
    }
}

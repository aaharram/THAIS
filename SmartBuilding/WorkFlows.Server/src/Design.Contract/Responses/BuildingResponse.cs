namespace Design.Contract.Responses;

public class BuildingResponse
{
    public int Numero { get; init; }

    public string CodeImmeuble { get; init; } = null!;
    public string Designation { get; init; } = null!;
    public bool EnExploitation { get; init; }
    public string? NoArticle { get; init; }
    public int? NoBuildingType { get; init; }
    public string? NomBuildingType { get; init; }
    public string? CompteGeneral { get; init; }
    public string NAffectation { get; init; } = null!;
    public string? TypeSequenceComptable { get; init; }
    public int? NoEncaisseur { get; init; }
    public string? NomEncaisseur { get; init; }
    public string? ProvenanceActif { get; init; }
    public bool AjouterContrainte { get; init; }
    public string NoProprieteType { get; init; } = null!;
    public int? NoProprietaire { get; init; }
    public string? NomProprietaire { get; init; }
    public string? Responsable { get; init; }
    public string? ContactResponsable { get; init; }
    public int? NoProspection { get; init; }

    public int? NoAgenceImmobiliere { get; init; }
    public string? NomAgenceImmobiliere { get; init; }
    public string? Proprietaire { get; init; }
    public string? ContactProprietaire { get; init; }
    public int? StatusProspect { get; init; }
    public int? StatusExpertiseTechnique { get; init; }
    public DateTime? DateExpertiseTechnique { get; init; }
    public DateTime? DateDemandeExpertiseTechnique { get; init; }
    public string? PjExpertiseTechnique { get; init; }
    public string? BuildingImage { get; init; }
    public string? BuildingPlan { get; init; }
    public string? BuildingPlanCadastrale { get; init; }
    public string? CertificatPropriete { get; init; }
    public string? RegInterieur { get; init; }
    public string? Certifconformite { get; init; }
    public string? ContratAcquisition { get; init; }

    public decimal? SuperficieRDC { get; init; }
    public decimal? SuperficieSS { get; init; }
    public decimal? SuperficieSP { get; init; }
    public decimal? Superficie1erEtage { get; init; }
    public decimal? Superficie2emeEtage { get; init; }
    public decimal? Superficie3emeEtage { get; init; }
    public decimal? Superficie4emeEtage { get; init; }
    public decimal? Superficie5emeEtage { get; init; }
    public decimal? Superficie6emeEtage { get; init; }
    public decimal? Superficie7emeEtage { get; init; }
    public decimal? Superficie8emeEtage { get; init; }
    public decimal? Superficie9emeEtage { get; init; }
    public decimal? Superficie10emeEtage { get; init; }
    public decimal? Superficie11emeEtage { get; init; }
    public decimal? Superficie12emeEtage { get; init; }
    public decimal? Superficie13emeEtage { get; init; }
    public decimal? Superficie14emeEtage { get; init; }
    public decimal? Superficie15emeEtage { get; init; }
    public decimal? Superficie16emeEtage { get; init; }
    public decimal? Superficie17emeEtage { get; init; }
    public decimal? Superficie18emeEtage { get; init; }
    public decimal? Superficie19emeEtage { get; init; }
    public decimal? Superficie20emeEtage { get; init; }
    public decimal? Superficie21emeEtage { get; init; }
    public decimal? Superficie22emeEtage { get; init; }
    public decimal? Superficie23emeEtage { get; init; }
    public decimal? Superficie24emeEtage { get; init; }
    public decimal? Superficie25emeEtage { get; init; }
    public decimal? Superficie { get; init; }

    public decimal? FacadePrincipale { get; init; }
    public decimal? FacadeArriere { get; init; }
    public decimal? FacadeLateraleDroite { get; init; }
    public decimal? FacadeLateraleGauche { get; init; }
    public decimal? FacadeEnBiais { get; init; }
    public decimal? LongueurFacade { get; init; }
    public int? NbFacade { get; init; }

    public decimal? ValeurRealisation { get; init; }
    public decimal? PrixCession { get; init; }
    public string? Acquereur { get; init; }
    public string? PromesseContratVente { get; init; }
    public DateTime? DateSignaturePromesseVente { get; init; }
    public DateTime? DateSignatureContratVente { get; init; }
    public DateTime? DateEnregistrementContratVente { get; init; }
    public decimal? EncaissementRecuCession { get; init; }
    public DateTime? DateReglementCession { get; init; }
    public bool Vendu { get; init; }
    public string? Observation { get; init; }

    public string? TitreFoncier { get; init; }
    public string? TypeTF { get; init; }
    public bool AVendre { get; init; }
    public string? Notes { get; init; }

    public string? Address1 { get; init; }
    public string? PostalCode { get; init; }
    public int? NoCity { get; init; }
    public string? NomCity { get; init; }
    public int? NoCountry { get; init; }
    public string? NomCountry { get; init; }
    public decimal? Latitude { get; init; }
    public decimal? Longitude { get; init; }

    public decimal? ValeurEntreeTerrain { get; init; }
    public decimal? ValeurEntreeConstruction { get; init; }
    public decimal? ValeurAmenagement { get; init; }
    public decimal? ValeurInventaire { get; init; }
    public DateTime? DateAcquisition { get; init; }
    public DateTime? DateModificationValeur { get; init; }

    public string? UnitCode { get; init; }
    public decimal? SurfaceTerrain { get; init; }
    public decimal? SurfaceUtile { get; init; }
    public decimal? SurfaceEspaceVert { get; init; }
    public decimal? SurfaceParking { get; init; }
    public int? NombrePlacesParking { get; init; }
    public int? NombreAscenseurs { get; init; }
    public string? MarqueAscenseur { get; init; }
    public int? NombreEtages { get; init; }

    public bool Accueil { get; init; }
    public bool Securite { get; init; }
    public bool Revetement { get; init; }
    public bool Peinture { get; init; }
    public bool FauxPlafond { get; init; }
    public bool Reseaux { get; init; }
    public bool Climatisation { get; init; }

    public bool Inactif { get; init; }
    public int NbLocaux { get; init; }
    public int NbBaux { get; init; }

    // RMANew (ListBuilding.vb, colonne "Revenu annuel") : somme des loyers des baux actifs
    // et quittancés de cet actif.
    public decimal RevenuAnnuel { get; init; }

    // RMANew (ListBuilding.vb, GetFicheS) : SUM(TableauAmortissement.TotalAmortiAlaFin)
    // pour cet actif.
    public decimal TotalAmortissement { get; init; }

    // RMANew (DataEntryBuilding.vb, AfterGenerate, "TotalProvis") : SUM(Provision.MontantProvision)
    // pour cet actif. Renseigné uniquement sur la fiche d'un actif (GetByIdAsync).
    public decimal TotalProvision { get; init; }

    // Date de la dernière expertise (même expertise que ValeurExpertiseTotal ci-dessous).
    public DateTime? DateExpertise { get; init; }

    // RMANew (ListBuilding.vb, GetFicheS) : champs de la dernière expertise enregistrée
    // pour cet actif (ORDER BY DateExpertiseActualiser DESC, TOP 1) - pas une somme.
    public decimal ValeurExpertiseTotal { get; init; }
    public decimal ValeurExpertiseTerrain { get; init; }
    public decimal ValeurExpertiseConstruction { get; init; }

    // RMANew (ListBuilding.vb, GetFicheS, "Bgt"/"Charges annuelles") :
    // SUM(AchatPresatation.MontantPrestation) de l'année en cours pour cet actif.
    public decimal ChargesAnnuelles { get; init; }

    // RMANew (Immeuble.vb, colonne "Budget de charge") : SUM(Charge.Montant) pour cet
    // actif - une table différente (Charge, budget de charges récurrentes) de
    // AchatPresatation utilisée pour ChargesAnnuelles ci-dessus.
    public decimal BudgetCharge { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

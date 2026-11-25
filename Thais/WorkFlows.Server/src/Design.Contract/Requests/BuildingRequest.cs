namespace Design.Contract.Requests;

public class BuildingRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required string CodeImmeuble { get; set; }
    public required string Designation { get; set; }
    public bool EnExploitation { get; set; }
    public string? NoArticle { get; set; }
    public int? NoBuildingType { get; set; }
    public string? CompteGeneral { get; set; }
    public required string NAffectation { get; set; }
    public string? TypeSequenceComptable { get; set; }
    public int? NoEncaisseur { get; set; }
    public string? ProvenanceActif { get; set; }
    public bool AjouterContrainte { get; set; }
    public string NoProprieteType { get; set; } = "Immeuble";
    public int? NoProprietaire { get; set; }
    public string? Responsable { get; set; }
    public string? ContactResponsable { get; set; }
    public int? NoProspection { get; set; }

    public string? TitreFoncier { get; set; }
    public string? TypeTF { get; set; }
    public bool AVendre { get; set; }
    public string? Notes { get; set; }

    public string? Address1 { get; set; }
    public string? PostalCode { get; set; }
    public int? NoCity { get; set; }
    public int? NoCountry { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public decimal? ValeurEntreeTerrain { get; set; }
    public decimal? ValeurEntreeConstruction { get; set; }
    public decimal? ValeurAmenagement { get; set; }
    public DateTime? DateAcquisition { get; set; }
    public DateTime? DateModificationValeur { get; set; }

    public string? UnitCode { get; set; }
    public decimal? SurfaceTerrain { get; set; }
    public decimal? SurfaceUtile { get; set; }
    public decimal? SurfaceEspaceVert { get; set; }
    public decimal? SurfaceParking { get; set; }
    public int? NombrePlacesParking { get; set; }
    public int? NombreAscenseurs { get; set; }
    public string? MarqueAscenseur { get; set; }
    public int? NombreEtages { get; set; }

    public bool Accueil { get; set; }
    public bool Securite { get; set; }
    public bool Revetement { get; set; }
    public bool Peinture { get; set; }
    public bool FauxPlafond { get; set; }
    public bool Reseaux { get; set; }
    public bool Climatisation { get; set; }

    public bool Inactif { get; set; }

    public int? NoAgenceImmobiliere { get; set; }
    public string? Proprietaire { get; set; }
    public string? ContactProprietaire { get; set; }
    public int? StatusProspect { get; set; }
    public int? StatusExpertiseTechnique { get; set; }
    public DateTime? DateExpertiseTechnique { get; set; }
    public DateTime? DateDemandeExpertiseTechnique { get; set; }
    public string? PjExpertiseTechnique { get; set; }
    public string? BuildingImage { get; set; }
    public string? BuildingPlan { get; set; }
    public string? BuildingPlanCadastrale { get; set; }
    public string? CertificatPropriete { get; set; }
    public string? RegInterieur { get; set; }
    public string? Certifconformite { get; set; }
    public string? ContratAcquisition { get; set; }

    public decimal? SuperficieRDC { get; set; }
    public decimal? SuperficieSS { get; set; }
    public decimal? SuperficieSP { get; set; }
    public decimal? Superficie1erEtage { get; set; }
    public decimal? Superficie2emeEtage { get; set; }
    public decimal? Superficie3emeEtage { get; set; }
    public decimal? Superficie4emeEtage { get; set; }
    public decimal? Superficie5emeEtage { get; set; }
    public decimal? Superficie6emeEtage { get; set; }
    public decimal? Superficie7emeEtage { get; set; }
    public decimal? Superficie8emeEtage { get; set; }
    public decimal? Superficie9emeEtage { get; set; }
    public decimal? Superficie10emeEtage { get; set; }
    public decimal? Superficie11emeEtage { get; set; }
    public decimal? Superficie12emeEtage { get; set; }
    public decimal? Superficie13emeEtage { get; set; }
    public decimal? Superficie14emeEtage { get; set; }
    public decimal? Superficie15emeEtage { get; set; }
    public decimal? Superficie16emeEtage { get; set; }
    public decimal? Superficie17emeEtage { get; set; }
    public decimal? Superficie18emeEtage { get; set; }
    public decimal? Superficie19emeEtage { get; set; }
    public decimal? Superficie20emeEtage { get; set; }
    public decimal? Superficie21emeEtage { get; set; }
    public decimal? Superficie22emeEtage { get; set; }
    public decimal? Superficie23emeEtage { get; set; }
    public decimal? Superficie24emeEtage { get; set; }
    public decimal? Superficie25emeEtage { get; set; }

    public decimal? FacadePrincipale { get; set; }
    public decimal? FacadeArriere { get; set; }
    public decimal? FacadeLateraleDroite { get; set; }
    public decimal? FacadeLateraleGauche { get; set; }
    public decimal? FacadeEnBiais { get; set; }
    public int? NbFacade { get; set; }

    public decimal? ValeurRealisation { get; set; }
    public decimal? PrixCession { get; set; }
    public string? Acquereur { get; set; }
    public string? PromesseContratVente { get; set; }
    public DateTime? DateSignaturePromesseVente { get; set; }
    public DateTime? DateSignatureContratVente { get; set; }
    public DateTime? DateEnregistrementContratVente { get; set; }
    public decimal? EncaissementRecuCession { get; set; }
    public DateTime? DateReglementCession { get; set; }
    public bool Vendu { get; set; }
    public string? Observation { get; set; }
}

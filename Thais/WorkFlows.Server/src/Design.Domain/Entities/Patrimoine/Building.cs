using Design.Domain.Common;

namespace Design.Domain.Entities.Patrimoine;

public class Building : Base
{
    // Identification
    public string CodeImmeuble { get; set; } = null!;
    public string Designation { get; set; } = null!;
    public bool EnExploitation { get; set; }
    public string? NoArticle { get; set; }
    public int? NoBuildingType { get; set; }
    public string? CompteGeneral { get; set; }
    public string NAffectation { get; set; } = null!; // N.A / GSR / GV / GG / AT / FP

    // RMANew (Building.TypeSéquenceComptable) : catégorie utilisée par JournalSqComptable
    // pour choisir les comptes GL (ADMIS/LIBRE) - absente du schéma repris jusqu'ici,
    // ajoutée uniquement pour le Journal Comptable.
    public string? TypeSequenceComptable { get; set; } // ADMIS / LIBRE
    public int? NoEncaisseur { get; set; }
    public string? ProvenanceActif { get; set; } // Construction / Acquisition / Location / Expropriation
    public bool AjouterContrainte { get; set; }
    public string NoProprieteType { get; set; } = "Immeuble"; // Immeuble | Bien (discriminant hérité de RMANew)
    public int? NoProprietaire { get; set; }
    public string? Responsable { get; set; }
    public string? ContactResponsable { get; set; }
    public int? NoProspection { get; set; } // rattachement à un dossier de Prospection (Commercialisation)

    // Titre foncier
    public string? TitreFoncier { get; set; }
    public string? TypeTF { get; set; } // Unique / Morcelé
    public bool AVendre { get; set; }
    public string? Notes { get; set; }

    // Localisation
    public string? Address1 { get; set; }
    public string? PostalCode { get; set; }
    public int? NoCity { get; set; }
    public int? NoCountry { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    // Valeurs
    public decimal? ValeurEntreeTerrain { get; set; }
    public decimal? ValeurEntreeConstruction { get; set; }
    public decimal? ValeurAmenagement { get; set; }
    public decimal? ValeurInventaire { get; set; }
    public DateTime? DateAcquisition { get; set; }
    public DateTime? DateModificationValeur { get; set; }

    // Surfaces
    public string? UnitCode { get; set; }
    public decimal? SurfaceTerrain { get; set; }
    public decimal? SurfaceUtile { get; set; }
    public decimal? SurfaceEspaceVert { get; set; }
    public decimal? SurfaceParking { get; set; }
    public int? NombrePlacesParking { get; set; }
    public int? NombreAscenseurs { get; set; }
    public string? MarqueAscenseur { get; set; }
    public int? NombreEtages { get; set; }

    // Équipements
    public bool Accueil { get; set; }
    public bool Securite { get; set; }
    public bool Revetement { get; set; }
    public bool Peinture { get; set; }
    public bool FauxPlafond { get; set; }
    public bool Reseaux { get; set; }
    public bool Climatisation { get; set; }

    public bool Inactif { get; set; }

    // Prospection / "Bien" (DataEntryBiens.aspx) — mêmes colonnes que celles ajoutées
    // à Building par RMANew pour le suivi d'un actif en prospection.
    public int? NoAgenceImmobiliere { get; set; }
    public string? Proprietaire { get; set; } // texte libre, distinct de NoProprietaire (FK)
    public string? ContactProprietaire { get; set; }
    public int? StatusProspect { get; set; } // "Sort" : 0=En cours, 2=Retenue, 1=Décliné
    public int? StatusExpertiseTechnique { get; set; } // 0=(vide), 1=Favorable, 2=Favorable sous réserve, 3=Défavorable
    public DateTime? DateExpertiseTechnique { get; set; }
    public DateTime? DateDemandeExpertiseTechnique { get; set; }
    public string? PjExpertiseTechnique { get; set; } // nom de fichier uniquement
    public string? BuildingImage { get; set; }
    public string? BuildingPlan { get; set; }

    // RMANew (DataEntryBuilding.aspx, bloc "Pièces jointes") : une colonne par type de document,
    // contenant le nom du fichier stocké (dossier "actifs" de AttachmentsController).
    public string? BuildingPlanCadastrale { get; set; }
    public string? CertificatPropriete { get; set; }
    public string? RegInterieur { get; set; } // règlement intérieur ou de copropriété
    public string? Certifconformite { get; set; }
    public string? ContratAcquisition { get; set; }

    public decimal? SuperficieRDC { get; set; }
    public decimal? SuperficieSS { get; set; } // sous-sol
    public decimal? SuperficieSP { get; set; } // mezzanine
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
    public decimal? Superficie { get; set; } // calculé : somme des superficies ci-dessus

    public decimal? FacadePrincipale { get; set; }
    public decimal? FacadeArriere { get; set; }
    public decimal? FacadeLateraleDroite { get; set; }
    public decimal? FacadeLateraleGauche { get; set; }
    public decimal? FacadeEnBiais { get; set; }
    public decimal? LongueurFacade { get; set; } // calculé : somme des façades ci-dessus
    public int? NbFacade { get; set; }

    // Cession (ListVentes.aspx / DataEntryVentes.aspx) — champs de suivi d'une vente,
    // saisis directement sur l'actif (Building) comme dans RMANew.
    public decimal? ValeurRealisation { get; set; }
    public decimal? PrixCession { get; set; }
    public string? Acquereur { get; set; } // BeneficiaireVentes
    public string? PromesseContratVente { get; set; } // Promesse_ContratVentes (nom de fichier)
    public DateTime? DateSignaturePromesseVente { get; set; }
    public DateTime? DateSignatureContratVente { get; set; }
    public DateTime? DateEnregistrementContratVente { get; set; }
    public decimal? EncaissementRecuCession { get; set; }
    public DateTime? DateReglementCession { get; set; }
    public bool Vendu { get; set; }
    public string? Observation { get; set; }
}

using Design.Domain.Common;

namespace Design.Domain.Entities.Patrimoine;

public class Local : Base
{
    // Identification
    public int NoBuilding { get; set; }
    public int? NoLocalType { get; set; }
    public string Designation { get; set; } = null!; // Nom du local
    public bool EnExploitation { get; set; }
    public bool Nondisponible { get; set; }
    public bool MoyensGeneraux { get; set; }
    public bool MettreEnLocation { get; set; }
    public string? Responsable { get; set; } // Gestionnaire

    // Surfaces / localisation
    public int? NbrePiece { get; set; }
    public decimal? Surface { get; set; }
    public decimal? Terrasse { get; set; } // Terrasse/Mezzanine
    public string? Address1 { get; set; }
    public string? TitreFoncier { get; set; }
    public bool AVendre { get; set; }
    public string? Etage { get; set; }
    public DateTime? DateModificationValeur { get; set; }
    public string? Notes { get; set; }

    // Complément d'information
    public decimal? DernierLoyer { get; set; }
    public decimal? ValeurEntree { get; set; }
    public decimal? ValeurInventaire { get; set; }
    public decimal? ValeurRealisation { get; set; }
    public string? Observation { get; set; }
    public string? Etat { get; set; } // Bon / Moyen / Mauvais / Très Mauvais
    public string? Demande { get; set; } // Demandé / Moins Demandé / Très Demandé
    public string? Suggestion { get; set; }
    public decimal? MontantAmenagement { get; set; }

    // Offre financière
    public decimal? OffreLoyerHT { get; set; }
    public decimal? OffreCharge { get; set; }
    public decimal? TVA { get; set; }
    public decimal? OffreTSC { get; set; }
    public decimal? OffreLoyerTTC { get; set; } // calculé : HT + TSC + Charges

    public bool Inactif { get; set; }

    // Cession (ListVentes.aspx / DataEntryVentes.aspx) — champs de suivi d'une vente
    // pour les locaux (lots) vendus séparément (Building.TypeTF = "Morcelé").
    public decimal? PrixCession { get; set; }
    public string? Acquereur { get; set; } // BeneficiaireVentes
    public string? PromesseContratVente { get; set; } // Promesse_ContratVentes (nom de fichier)
    public DateTime? DateSignaturePromesseVente { get; set; }
    public DateTime? DateSignatureContratVente { get; set; }
    public DateTime? DateEnregistrementContratVente { get; set; }
    public decimal? EncaissementRecuCession { get; set; }
    public DateTime? DateReglementCession { get; set; }
    public bool Vendu { get; set; }
}

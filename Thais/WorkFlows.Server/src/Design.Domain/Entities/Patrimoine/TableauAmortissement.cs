using Design.Domain.Common;

namespace Design.Domain.Entities.Patrimoine;

public class TableauAmortissement : Base
{
    public int NoBuilding { get; set; }
    public int ImmobConcernees { get; set; } // FK -> TypologieImmobilisation

    public DateTime? DateEntree { get; set; }
    public decimal VaPrixAcquisition { get; set; } // Valeur d'entrée

    public decimal? ValeurTerrain { get; set; }
    public decimal? ValeurConstruction { get; set; }
    public decimal? ValeurAmenagement { get; set; }

    // Calculés côté serveur à partir du Taux/Durée de la TypologieImmobilisation
    // (amortissement linéaire), comme RMANew (DataEntryAmortissemnt.Validate).
    public decimal AmortiAnterieurs { get; set; }
    public decimal AmortiDbeneficebTaux { get; set; }
    public int AmortiDbenficebDuree { get; set; }
    public decimal AmortiDbeneficebNorm { get; set; }
    public decimal TotalAmortiAlaFin { get; set; }
    public DateTime? DateProchaineAmorti { get; set; }

    public bool ImmobPrincipal { get; set; }
    public bool Inactif { get; set; }
}

public class TableauAmortissementVersion : Base
{
    public int NoTableauAmortissement { get; set; }
    public decimal AmortissementsAnterieurs { get; set; }
    public decimal AmortissementsNormaux { get; set; }
    public DateTime DateAmortissement { get; set; }
}

// RMANew (ListAmortissement.vb, OrdreGenerationAmortissement) : trace qu'un mois a été
// validé (le dropdown "Valider tableau d'amortissement" l'affiche avec "(Validé)"),
// indépendamment du fait qu'une ligne ait ou non été mise à jour ce mois-là.
public class AmortissementValidation : Base
{
    public DateTime Periode { get; set; } // 1er jour du mois validé
}

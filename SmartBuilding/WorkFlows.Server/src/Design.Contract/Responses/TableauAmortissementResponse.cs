namespace Design.Contract.Responses;

public class TableauAmortissementResponse
{
    public int Numero { get; init; }

    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public string? TitreFoncier { get; init; }
    public string? CompteComptable { get; init; } // "Compte" (TypologieImmobilisation)
    public string? CompteGeneral { get; init; } // "Sous Compte" (Building)
    public string? NAffectation { get; init; }

    public int ImmobConcernees { get; init; }
    public string? NomImmobConcernees { get; init; }

    public DateTime? DateEntree { get; init; }
    public decimal VaPrixAcquisition { get; init; }

    public decimal? ValeurTerrain { get; init; }
    public decimal? ValeurConstruction { get; init; }
    public decimal? ValeurAmenagement { get; init; }

    public decimal AmortiAnterieurs { get; init; }
    public decimal AmortiDbeneficebTaux { get; init; }
    public int AmortiDbenficebDuree { get; init; }
    public decimal AmortiDbeneficebNorm { get; init; }
    public decimal TotalAmortiAlaFin { get; init; }
    public DateTime? DateProchaineAmorti { get; init; }

    public bool ImmobPrincipal { get; init; }
    public bool Inactif { get; init; }

    public List<TableauAmortissementVersionResponse> Versions { get; init; } = [];

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

public class TableauAmortissementVersionResponse
{
    public int Numero { get; init; }
    public decimal AmortissementsAnterieurs { get; init; }
    public decimal AmortissementsNormaux { get; init; }
    public DateTime DateAmortissement { get; init; }
}

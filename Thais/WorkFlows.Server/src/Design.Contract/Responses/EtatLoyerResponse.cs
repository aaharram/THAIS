namespace Design.Contract.Responses;

public class EtatLoyerLigneResponse
{
    public int NoLocation { get; set; }
    public string? NumContratLocations { get; set; }
    public string? Locataire { get; set; }

    public decimal Revenu { get; set; }
    public decimal Encaissement { get; set; }
    public decimal Enc { get; set; }
    public decimal Autres { get; set; }

    public decimal Impaye { get; set; }
    public int NbMoisImpaye { get; set; }

    public DateTime? DateLimitePai { get; set; }
}

public class EtatLoyerBuildingResponse
{
    public int NoBuilding { get; set; }
    public string? Immeuble { get; set; }
    public string? CodeImmeuble { get; set; }
    public string? CompteGeneral { get; set; }
    public string? NAffectation { get; set; } // N.A / GSR / GV / GG / AT / FP

    public List<EtatLoyerLigneResponse> Lignes { get; set; } = [];

    public decimal RevenuTotal { get; set; }
    public decimal EncaissementTotal { get; set; }
    public decimal ImpayeTotal { get; set; }
}

public class EtatLoyerResponse
{
    public int Annee { get; set; }
    public int Mois { get; set; }
    public bool Valide { get; set; }
    public DateTime? DateValidation { get; set; }

    public List<EtatLoyerBuildingResponse> Buildings { get; set; } = [];

    public decimal RevenuGrandTotal { get; set; }
    public decimal EncaissementGrandTotal { get; set; }
    public decimal ImpayeGrandTotal { get; set; }
}

public class PeriodeValideeResponse
{
    public int Annee { get; set; }
    public int Mois { get; set; }
    public DateTime DateValidation { get; set; }
}

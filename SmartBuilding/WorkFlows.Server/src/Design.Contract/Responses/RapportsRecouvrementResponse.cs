namespace Design.Contract.Responses;

// État Impayé (par propriétaire)
public class EtatImpayeLigneResponse
{
    public int? NoProprietaire { get; set; }
    public string? Proprietaire { get; set; }
    public decimal MontantImpaye { get; set; }
    public int NbDossiers { get; set; }
}

public class EtatImpayeResponse
{
    public List<EtatImpayeLigneResponse> Lignes { get; set; } = [];
    public decimal TotalImpaye { get; set; }
    public int TotalDossiers { get; set; }
}

// Aperçu Émissions / Encaissement (résumé global période)
public class ApercuEmissionsEncaissementResponse
{
    public int Annee { get; set; }
    public int Mois { get; set; }
    public decimal TotalEmissions { get; set; }
    public decimal TotalEncaissement { get; set; }
    public decimal TauxEncaissement { get; set; }
    public int NbFactures { get; set; }
}

// Suivi Encaissement (détail des encaissements par immeuble)
public class SuiviEncaissementLigneResponse
{
    public int NoPaiement { get; set; }
    public string? Locataire { get; set; }
    public string? Etage { get; set; }
    public string? Local { get; set; }
    public string? ModePaiement { get; set; }
    public DateTime DatePaiement { get; set; }
    public decimal Montant { get; set; }
    public string? Encaisseur { get; set; }
    public decimal? LoyerNet { get; set; }
    public decimal? Charges { get; set; }
    public decimal? Taxe { get; set; }
    public decimal? TVA { get; set; }
    public decimal? TotalMois { get; set; }
}

public class SuiviEncaissementBuildingResponse
{
    public int NoBuilding { get; set; }
    public string? Immeuble { get; set; }
    public string? CodeImmeuble { get; set; }
    public List<SuiviEncaissementLigneResponse> Lignes { get; set; } = [];
    public decimal TotalEncaissement { get; set; }
}

public class SuiviEncaissementResponse
{
    public List<SuiviEncaissementBuildingResponse> Buildings { get; set; } = [];
    public decimal GrandTotal { get; set; }
}

// Rapport Encaisseur (statistiques mensuelles sur une année)
public class RapportEncaisseurLigneResponse
{
    public int Mois { get; set; }
    public decimal Emissions { get; set; }
    public decimal Encaissement { get; set; }
    public int NbFactures { get; set; }
    public decimal TauxEncaissement { get; set; }
}

public class RapportEncaisseurResponse
{
    public int Annee { get; set; }
    public int? NoEncaisseur { get; set; }
    public List<RapportEncaisseurLigneResponse> Lignes { get; set; } = [];
    public decimal TotalEmissions { get; set; }
    public decimal TotalEncaissement { get; set; }
    public decimal TauxGlobal { get; set; }
}

// Prime Encaisseur (commission mensuelle)
public class PrimeEncaisseurLigneResponse
{
    public int NoEncaisseur { get; set; }
    public string? Encaisseur { get; set; }
    public int NbFacturesMoisCourant { get; set; }
    public int NbFacturesMoisPrecedent { get; set; }
    public decimal Emission { get; set; }
    public decimal Encaissement { get; set; }
    public decimal? Pourcentage { get; set; }
    public decimal PrimeForfait { get; set; }
    public decimal Bonus { get; set; }
    public decimal TotalPrime { get; set; }
}

public class PrimeEncaisseurResponse
{
    public int Annee { get; set; }
    public int Mois { get; set; }
    public List<PrimeEncaisseurLigneResponse> Lignes { get; set; } = [];
    public decimal TotalPrime { get; set; }
}

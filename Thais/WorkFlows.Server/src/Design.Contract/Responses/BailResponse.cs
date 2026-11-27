namespace Design.Contract.Responses;

public class BailResponse
{
    public int Numero { get; init; }

    public string? NumContratLocations { get; init; }
    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int NoLocal { get; init; }
    public string? NomLocal { get; init; }
    public string? Etage { get; init; }
    public decimal? Surface { get; init; }
    public int NoLocataire { get; init; }
    public string? NomLocataire { get; init; }

    // RMANew (ListLocation) : adresse du locataire, dernière et prochaine révision du loyer (table RévisionLoyer).
    public string? AdresseLocataire { get; set; }
    // RMANew (DataEntryLocation, « Etat des Avoirs ») : somme des avoirs émis sur ce bail.
    public decimal MontantAvoirs { get; set; }
    public DateTime? DateDerniereRevision { get; set; }
    public DateTime? DateProchaineRevision { get; set; }
    public int? NoEncaisseur { get; init; }
    public string? NomEncaisseur { get; init; }
    public int? NoPeriodicity { get; init; }
    public string? NomPeriodicity { get; init; }

    public string? Usage { get; init; }
    public DateTime? DateDebut { get; init; }
    public DateTime? DateGestion { get; init; }
    public DateTime? DateFin { get; init; }
    public int? Franchise { get; init; }

    public decimal? LoyerNet { get; init; }
    public decimal? Charges { get; init; }
    public decimal? TVA { get; init; }
    public decimal? Taxe { get; init; }
    public decimal? LoyerGarage { get; init; }
    public decimal? Autres { get; init; }
    public decimal? Montant { get; init; }

    public bool GenererQuittance { get; init; }
    public decimal? Garantie { get; init; }
    public decimal? Caution { get; init; }
    public string? ModeReglement { get; init; }
    public string Etat { get; init; } = null!;

    public string? Notes { get; init; }

    // RMANew (DataEntryLocation) : champs du formulaire de bail repris de RMA.
    public string? TypeSequenceComptable { get; init; }
    public decimal? TauxRevisionLoyer { get; init; }
    public int? Duree { get; init; }
    public bool DepotGarantie { get; init; }
    public string? CautionFichier { get; init; }
    public string? Reference { get; init; }
    public DateTime? DateReglement { get; init; }
    public decimal? ResteCaution { get; init; }
    public bool UtiliseeCaution { get; init; }
    public string? Observation { get; init; }
    public decimal? LoyersImpayes { get; init; }
    public DateTime? DebutImpayes { get; init; }
    public DateTime? FinImpayes { get; init; }
    public int? NbMoisImpayes { get; init; }
    public decimal? ArrieresAugmentation { get; init; }
    public bool Contentieux { get; init; }
    public DateTime? DebutArriere { get; init; }
    public DateTime? FinArriere { get; init; }
    public decimal? FraisJustice { get; init; }
    public string? ContratFichier { get; init; }
    public bool Inactif { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

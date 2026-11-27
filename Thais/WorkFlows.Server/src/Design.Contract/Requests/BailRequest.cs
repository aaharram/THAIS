namespace Design.Contract.Requests;

public class BailRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public string? NumContratLocations { get; set; }
    public required int NoBuilding { get; set; }
    public required int NoLocal { get; set; }
    public required int NoLocataire { get; set; }
    public int? NoEncaisseur { get; set; }
    public int? NoPeriodicity { get; set; }

    public string? Usage { get; set; }
    public DateTime? DateDebut { get; set; }
    public DateTime? DateGestion { get; set; }
    public DateTime? DateFin { get; set; }
    public int? Franchise { get; set; }

    public decimal? LoyerNet { get; set; }
    public decimal? Charges { get; set; }
    public decimal? TVA { get; set; }
    public decimal? Taxe { get; set; }
    public decimal? LoyerGarage { get; set; }
    public decimal? Autres { get; set; }

    public bool GenererQuittance { get; set; }
    public decimal? Garantie { get; set; }
    public decimal? Caution { get; set; }
    public string? ModeReglement { get; set; }
    public string Etat { get; set; } = "En cours de location";

    public string? Notes { get; set; }

    // RMANew (DataEntryLocation) : champs du formulaire de bail repris de RMA.
    public string? TypeSequenceComptable { get; set; }
    public decimal? TauxRevisionLoyer { get; set; }
    public int? Duree { get; set; }
    public bool DepotGarantie { get; set; }
    public string? CautionFichier { get; set; }
    public string? Reference { get; set; }
    public DateTime? DateReglement { get; set; }
    public decimal? ResteCaution { get; set; }
    public bool UtiliseeCaution { get; set; }
    public string? Observation { get; set; }
    public decimal? LoyersImpayes { get; set; }
    public DateTime? DebutImpayes { get; set; }
    public DateTime? FinImpayes { get; set; }
    public int? NbMoisImpayes { get; set; }
    public decimal? ArrieresAugmentation { get; set; }
    public bool Contentieux { get; set; }
    public DateTime? DebutArriere { get; set; }
    public DateTime? FinArriere { get; set; }
    public decimal? FraisJustice { get; set; }
    public string? ContratFichier { get; set; }
    public bool Inactif { get; set; }
}

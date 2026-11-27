namespace Design.Contract.Requests;

public class LocalRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public int? NoLocalType { get; set; }
    public required string Designation { get; set; }
    public bool EnExploitation { get; set; }
    public bool Nondisponible { get; set; }
    public bool MoyensGeneraux { get; set; }
    public bool MettreEnLocation { get; set; }
    public string? Responsable { get; set; }

    public int? NbrePiece { get; set; }
    public decimal? Surface { get; set; }
    public decimal? Terrasse { get; set; }
    public string? Address1 { get; set; }
    public string? TitreFoncier { get; set; }
    public bool AVendre { get; set; }
    public string? Etage { get; set; }
    public DateTime? DateModificationValeur { get; set; }
    public string? Notes { get; set; }

    public decimal? DernierLoyer { get; set; }
    public decimal? ValeurEntree { get; set; }
    public decimal? ValeurInventaire { get; set; }
    public decimal? ValeurRealisation { get; set; }
    public string? Observation { get; set; }
    public string? Image { get; set; }
    public string? PlanLocal { get; set; }
    public string? Etat { get; set; }
    public string? Demande { get; set; }
    public string? Suggestion { get; set; }
    public decimal? MontantAmenagement { get; set; }

    public decimal? OffreLoyerHT { get; set; }
    public decimal? OffreCharge { get; set; }
    public decimal? TVA { get; set; }
    public decimal? OffreTSC { get; set; }

    public bool Inactif { get; set; }

    public decimal? PrixCession { get; set; }
    public string? Acquereur { get; set; }
    public string? PromesseContratVente { get; set; }
    public DateTime? DateSignaturePromesseVente { get; set; }
    public DateTime? DateSignatureContratVente { get; set; }
    public DateTime? DateEnregistrementContratVente { get; set; }
    public decimal? EncaissementRecuCession { get; set; }
    public DateTime? DateReglementCession { get; set; }
    public bool Vendu { get; set; }
}

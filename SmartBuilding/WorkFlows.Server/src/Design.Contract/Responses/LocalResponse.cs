namespace Design.Contract.Responses;

public class LocalResponse
{
    public int Numero { get; init; }

    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int? NoLocalType { get; init; }
    public string? NomLocalType { get; init; }
    public string Designation { get; init; } = null!;
    public bool EnExploitation { get; init; }
    public bool Nondisponible { get; init; }
    public bool MoyensGeneraux { get; init; }
    public bool MettreEnLocation { get; init; }
    public string? Responsable { get; init; }

    public int? NbrePiece { get; init; }
    public decimal? Surface { get; init; }
    public decimal? Terrasse { get; init; }
    public string? Address1 { get; init; }
    public string? TitreFoncier { get; init; }
    public bool AVendre { get; init; }
    public string? Etage { get; init; }
    public DateTime? DateModificationValeur { get; init; }
    public string? Notes { get; init; }

    public decimal? DernierLoyer { get; init; }
    public decimal? ValeurEntree { get; init; }
    public decimal? ValeurInventaire { get; init; }
    public decimal? ValeurRealisation { get; init; }
    public string? Observation { get; init; }
    public string? Etat { get; init; }
    public string? Demande { get; init; }
    public string? Suggestion { get; init; }
    public decimal? MontantAmenagement { get; init; }

    public decimal? OffreLoyerHT { get; init; }
    public decimal? OffreCharge { get; init; }
    public decimal? TVA { get; init; }
    public decimal? OffreTSC { get; init; }
    public decimal? OffreLoyerTTC { get; init; }

    public bool Inactif { get; init; }

    public decimal? PrixCession { get; init; }
    public string? Acquereur { get; init; }
    public string? PromesseContratVente { get; init; }
    public DateTime? DateSignaturePromesseVente { get; init; }
    public DateTime? DateSignatureContratVente { get; init; }
    public DateTime? DateEnregistrementContratVente { get; init; }
    public decimal? EncaissementRecuCession { get; init; }
    public DateTime? DateReglementCession { get; init; }
    public bool Vendu { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

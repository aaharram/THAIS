namespace Design.Contract.Requests;

public class RevisionLoyerRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoLocation { get; set; }

    // Optionnels : calculés côté serveur (taux par usage, loyer révisé, prochaine
    // échéance triennale) si non fournis - voir RevisionLoyerService.
    public decimal? AncienLoyer { get; set; }
    public decimal? NouveauLoyer { get; set; }
    public decimal? TauxRevision { get; set; }
    public DateTime? DateRevision { get; set; }
    public DateTime? DateProchaineRevision { get; set; }
    public decimal? Reliquat { get; set; }
    public string? Notes { get; set; }
}

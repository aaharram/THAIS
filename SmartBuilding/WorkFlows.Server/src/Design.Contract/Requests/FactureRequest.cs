namespace Design.Contract.Requests;

// Génération d'une facture pour un bail et une période. Les composantes du loyer et le
// montant total sont calculés côté serveur depuis le Bail si non fournis (voir
// FactureService.GenererAsync) - c'est un instantané, pas une référence live au bail.
public class FactureRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoLocation { get; set; }
    public required DateTime Periode { get; set; }
    public DateTime? DateEcheance { get; set; }
    public string? TypeFacture { get; set; }

    public decimal? LoyerNet { get; set; }
    public decimal? Charges { get; set; }
    public decimal? TVA { get; set; }
    public decimal? Taxe { get; set; }
    public decimal? Autres { get; set; }

    public string? Notes { get; set; }
}

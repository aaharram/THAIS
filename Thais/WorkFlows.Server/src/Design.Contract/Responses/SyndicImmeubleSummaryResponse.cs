namespace Design.Contract.Responses;

// Vue "Gestion des syndics" niveau immeuble (RMANew: ListSyndicImmeuble.aspx) - une ligne
// par actif, avec le dernier nombre de quotes-parts connu et le compte des réunions
// historiques.
public class SyndicImmeubleSummaryResponse
{
    public int NoBuilding { get; init; }
    public string NomBuilding { get; init; } = null!;
    public int? NombreQuotePart { get; init; }
    public int NombreReunions { get; init; }
}

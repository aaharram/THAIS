using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (ListSyndicImmeuble.vb / DataEntrySyndicReunion.vb) : une réunion de syndic suit
// un appel de fonds (quote-part) par immeuble - pas d'ordre du jour/PV formalisé, pas de
// récurrence ni de quorum. Pièces jointes conservées en nom de fichier uniquement (aucune
// infra d'upload dans l'app, même convention que Building.PjExpertiseTechnique).
public class SyndicReunion : Base
{
    public int NoBuilding { get; set; }
    public string? Type { get; set; } // AGO / AGE
    public DateTime? DateReunion { get; set; }
    public bool Reglee { get; set; }
    public DateTime? DateReglement { get; set; }
    public int? NoVille { get; set; } // Lieu
    public int? NombreQuotePart { get; set; }
    public decimal? QuotePartAppelFonds { get; set; }
    public decimal? AppelFondsAnnuel { get; set; }
    public string? PjConvocation { get; set; }
    public string? PjPV { get; set; }
    public string? PjAppelFonds { get; set; }
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

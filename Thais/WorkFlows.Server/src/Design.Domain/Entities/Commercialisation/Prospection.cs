using Design.Domain.Common;

namespace Design.Domain.Entities.Commercialisation;

public class Prospection : Base
{
    public string? Description { get; set; } // Zone
    public int? Typologie { get; set; } // Destination
    public int? TypeOperation { get; set; } // Nature de l'offre
    public int? SituationProspection { get; set; } // Statut

    public DateTime? DateAjout { get; set; }
    public DateTime? DateAdjudication { get; set; } // date d'accord de la BPP
    public DateTime? DateContrat { get; set; }

    public string? Notes { get; set; }

    // Pièces jointes : uniquement le nom du fichier (comme RMANew, qui ne stocke
    // que des varchar référençant un partage de fichiers - pas de contenu binaire).
    public string? Pv { get; set; }
    public string? AvisBPP { get; set; }
    public string? AvisDPAL { get; set; }
    public string? SupportCA { get; set; }
    public string? BusinesPlan { get; set; }

    public bool Inactif { get; set; }
}

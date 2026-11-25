using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (DataEntryPrestataireContrat.vb) : dates par défaut à AddDate si non renseignées,
// aucune vérification DateFin > DateDebut - comportement conservé à l'identique.
public class PrestataireContrat : Base
{
    public int NoPrestataire { get; set; }
    public string? NumeroContrat { get; set; } // auto-généré "CNTR<id>" après la première sauvegarde
    public string? Objet { get; set; }
    public DateTime? DateContrat { get; set; }
    public DateTime? DateDebut { get; set; }
    public DateTime? DateFin { get; set; }
    public decimal? Montant { get; set; }
    public string? PieceJointe { get; set; } // nom de fichier uniquement, pas d'infra d'upload
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

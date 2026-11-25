using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (DataEntryAssurance.vb) : registre de polices au niveau société, pas rattaché à un
// Building. Pas de date de fin ni de contrôle de chevauchement - gap connu, conservé pour parité.
public class Assurance : Base
{
    public string? NumPolice { get; set; }
    public int NoAssureur { get; set; }
    public int? NoCourtier { get; set; }
    public string? TypeCouverture { get; set; }
    public DateTime? DateEffetContrat { get; set; }
    public decimal? Montant { get; set; }
    public string Statut { get; set; } = "EnCours"; // EnCours / Terminé
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (DataEntryReclamation.vb, table EleaseReclamation) : le seul des modules
// analysés à cumuler Building + Local + Locataire (tous déjà migrés). Building
// obligatoire à la sauvegarde (contrôle bloquant confirmé dans le legacy).
public class Reclamation : Base
{
    public int NoBuilding { get; set; }
    public int? NoLocal { get; set; }
    public int NoLocataire { get; set; }

    public string Etat { get; set; } = "Ouverte"; // Ouverte / En cours / Résolue / Clôturée
    public DateTime? DateReclamation { get; set; }
    public string? Objet { get; set; }
    public string? Notes { get; set; }
}

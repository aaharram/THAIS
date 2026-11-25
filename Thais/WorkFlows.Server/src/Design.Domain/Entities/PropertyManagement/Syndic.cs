using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (DataEntryEleaseSyndic.vb, table EleaseSyndic) : le syndic (mandataire, personne)
// n'a aucune FK vers Building - confirmé par grep, c'est un registre au niveau société,
// indépendant des réunions (SyndicReunion n'a pas de FK vers EleaseSyndic non plus).
public class Syndic : Base
{
    public string Nom { get; set; } = null!;
    public string? Prenom { get; set; }
    public string? Poste { get; set; }
    public string? Telephone { get; set; }
    public DateTime? DebutMandat { get; set; }
    public DateTime? FinMandat { get; set; }
    public string? IdSyndic { get; set; } // auto "SYN{Numero}" après le premier save
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

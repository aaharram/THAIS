using Design.Domain.Common;

namespace Design.Domain.Entities.Patrimoine;

// RMANew (DataEntryBuilding.aspx, bloc "Complètement Pièces jointes", table BuildingPieceJointe) :
// documents libres rattachés à un actif, en nombre illimité (contrairement aux sept pièces
// jointes nommées portées directement par Building).
public class BuildingPieceJointe : Base
{
    public int NoBuilding { get; set; }
    public string FileName { get; set; } = null!; // nom d'origine, affiché à l'utilisateur
    public string PieceJointe { get; set; } = null!; // nom du fichier stocké (dossier "actifs")
    public long Taille { get; set; }
}

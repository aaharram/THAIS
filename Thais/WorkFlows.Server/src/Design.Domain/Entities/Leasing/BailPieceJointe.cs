using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (DataEntryLocation.aspx, bloc « Pièces jointes », LXPiecejointe / LXDocumentJoint) :
// documents libres rattachés à un bail, en nombre illimité (en plus du reçu de dépôt de garantie
// et du contrat portés directement par Bail).
public class BailPieceJointe : Base
{
    public int NoLocation { get; set; }
    public string FileName { get; set; } = null!; // nom d'origine, affiché à l'utilisateur
    public string PieceJointe { get; set; } = null!; // nom du fichier stocké (dossier "baux")
    public long Taille { get; set; }
}

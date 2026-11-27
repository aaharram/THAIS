namespace Design.Contract.Requests;

// Enregistre un document déjà téléversé via POST api/attachments/baux (qui renvoie le nom
// généré du fichier stocké) comme pièce jointe libre d'un bail.
public class BailPieceJointeRequest
{
    public int? AddUser { get; set; }

    public required string FileName { get; set; } // nom d'origine affiché
    public required string PieceJointe { get; set; } // nom du fichier stocké
    public long Taille { get; set; }
}

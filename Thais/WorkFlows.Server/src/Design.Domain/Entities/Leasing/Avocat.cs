using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (ListAvocat.aspx / Classes/ListAvocat.vb, table Avocat) : sous-liste d'avocats
// rattachés à un dossier SuiviContentieux (NoContentieux), gérée depuis un CRUD séparé
// atteint via le compteur "Avocat" de ListSuiviJuridique.aspx.
public class Avocat : Base
{
    public int NoContentieux { get; set; }

    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Cabinet { get; set; }
    public string? Contrat { get; set; }
    public string? PieceJointe { get; set; }
}

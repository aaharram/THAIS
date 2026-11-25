namespace Design.Contract.Responses;

public class BuildingPieceJointeResponse
{
    public int Numero { get; init; }
    public int NoBuilding { get; init; }
    public string FileName { get; init; } = null!;
    public string PieceJointe { get; init; } = null!;
    public long Taille { get; init; }
    public DateTime AddDate { get; init; }
}

// RMANew (DataEntryBuilding.vb, BeforeGenerate, "Immobilisation en cours") : prestations
// amorties (AchatPresatation.isAmorti=1) dont le compte comptable du bon de commande commence
// par « 2 » (classe 2 = immobilisations), rattachées à l'actif.
public class ImmobilisationEnCoursResponse
{
    public int Numero { get; init; }
    public string Prestation { get; init; } = "";
    public DateTime? DateDebut { get; init; } // date du bon de commande
    public decimal ValeurEntree { get; init; } // montant TTC de la prestation
    public decimal TotalAmorti { get; init; }
}

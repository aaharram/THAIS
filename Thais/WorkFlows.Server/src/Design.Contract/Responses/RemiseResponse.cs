namespace Design.Contract.Responses;

public class RemiseResponse
{
    public int Numero { get; init; }
    public string? NumRemise { get; init; }
    public decimal Montant { get; init; }
    public decimal? MontantRestant { get; init; }
    public int Statut { get; init; }
    public string? Reference { get; init; }
    public bool IsAnnuler { get; init; }
    public DateTime? DateAnnulation { get; init; }

    // RMANew (ListRemise.aspx, colonne "Date d'entrée") : AddDate, pas un champ dédié.
    public DateTime AddDate { get; init; }
}

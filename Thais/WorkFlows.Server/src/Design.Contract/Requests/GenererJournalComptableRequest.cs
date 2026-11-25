namespace Design.Contract.Requests;

public class GenererJournalComptableRequest
{
    public int Annee { get; set; }
    public int Mois { get; set; }
    public int? NoProprietaire { get; set; }
    public string TypeJournal { get; set; } = null!;
    public int GenerePar { get; set; }
}

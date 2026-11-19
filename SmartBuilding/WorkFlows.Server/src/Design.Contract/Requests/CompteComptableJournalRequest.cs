namespace Design.Contract.Requests;

public class CompteComptableJournalRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public string TypeJournal { get; set; } = null!;
    public string TypeSequenceComptable { get; set; } = null!;
    public string CompteDebit { get; set; } = null!;
    public string CompteCredit { get; set; } = null!;
    public string? SousCompte { get; set; }
    public string? Description { get; set; }
}

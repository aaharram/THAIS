namespace Design.Contract.Responses;

public class CompteComptableJournalResponse
{
    public int Numero { get; set; }
    public string TypeJournal { get; set; } = null!;
    public string TypeSequenceComptable { get; set; } = null!;
    public string CompteDebit { get; set; } = null!;
    public string CompteCredit { get; set; } = null!;
    public string? SousCompte { get; set; }
    public string? Description { get; set; }
}

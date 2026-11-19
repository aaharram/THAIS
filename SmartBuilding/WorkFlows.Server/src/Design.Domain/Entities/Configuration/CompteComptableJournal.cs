using Design.Domain.Common;

namespace Design.Domain.Entities.Configuration;

// RMANew (Classes/JournalSqComptable.vb) : comptes GL (cpte/sous-compte) codés en dur par
// type d'écriture et par TypeSéquenceComptable (ADMIS/LIBRE) - extrait ici en table de
// configuration éditable plutôt que reproduit en constantes, les codes exacts touchant la
// comptabilité réelle et devant être validés/ajustés par le service comptable.
public class CompteComptableJournal : Base
{
    public string TypeJournal { get; set; } = null!; // EmissionLoyers / AnnulationEmissionLoyers / EmissionLoyersContentieux / EncaissementLoyers / EncaissementLoyersContentieux
    public string TypeSequenceComptable { get; set; } = null!; // ADMIS / LIBRE

    public string CompteDebit { get; set; } = null!;
    public string CompteCredit { get; set; } = null!;
    public string? SousCompte { get; set; }
    public string? Description { get; set; }
}

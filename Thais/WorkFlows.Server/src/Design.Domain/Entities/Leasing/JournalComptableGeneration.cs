using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (JournalSqComptable/JournalSmartStream) : n'a pas de table dédiée - réutilise en
// pratique OrdreGenerationQuittance (table de génération de quittances) pour tracer le
// statut d'export SmartStream (StatutSMS), une confusion de responsabilités entre deux
// concepts différents (facturation vs. journal comptable). Ici, une table propre au journal
// comptable : journal de piste (audit) des générations, pas un verrou empêchant de
// régénérer (le legacy ne bloque pas non plus une re-génération).
public class JournalComptableGeneration : Base
{
    public int Annee { get; set; }
    public int Mois { get; set; }
    public int? NoProprietaire { get; set; }
    public string TypeJournal { get; set; } = null!;

    public DateTime DateGeneration { get; set; }
    public int GenerePar { get; set; }
    public int NbLignes { get; set; }
    public decimal MontantTotal { get; set; }
}

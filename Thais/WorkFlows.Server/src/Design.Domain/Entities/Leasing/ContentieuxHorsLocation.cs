using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (table ContentieuxHorsLocation, DataEntryContentieuxHorsLocation.vb) : dossier de
// contentieux pour un locataire SANS bail actif - à la différence de SuiviContentieux
// (rattaché à un Bail via NoLocation), cette table RMANew est entièrement dénormalisée :
// Locataire/CodeLocataire/Immeuble sont de simples colonnes texte, pas des clés étrangères.
public class ContentieuxHorsLocation : Base
{
    public string? Locataire { get; set; }
    public string? CodeLocataire { get; set; }
    public string? Immeuble { get; set; }
    public decimal? LoyerMensuelTTC { get; set; }
    public DateTime DateDebutImpaye { get; set; }
    public DateTime DateFinImpaye { get; set; }
    public decimal? MontantLoyerImpaye { get; set; }

    // 0 = Amiable, 1 = Confié / Avocat (DataEntryContentieuxHorsLocation.aspx, LXType)
    public int Type { get; set; }
}

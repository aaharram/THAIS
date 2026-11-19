using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (ListTaxe.vb / DataEntryTaxe.vb) : archives des taxes par actif/local/année.
// Le sous-module "Déclarations Taxes" (champs de taxe portés directement sur Local +
// génération annuelle par lot "GenererTaxes") n'est pas repris ici : ce bloc couvre
// uniquement le CRUD des archives de taxes, cohérent avec les autres modules Property
// Management de cette passe. Schéma aligné sur la table "Taxe" déjà créée en base par
// une autre session en parallèle (mêmes colonnes, y compris NoLocataire/Notes/Inactif).
public class Taxe : Base
{
    public int NoBuilding { get; set; }
    public int? NoLocal { get; set; }
    public int? NoLocataire { get; set; }
    public int NoType { get; set; }

    public string? IdFiscal { get; set; }
    public string? NoArticle { get; set; }
    public decimal? MontantTaxe { get; set; }
    public int Annee { get; set; }
    public bool Paye { get; set; }
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

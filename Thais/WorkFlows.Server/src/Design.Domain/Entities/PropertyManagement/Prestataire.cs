using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// Table "Prestataire" partagée avec le futur module de sélection de prestataires
// (appel d'offres) : un prestataire reste la même société, qu'il soit saisi
// manuellement (RMANew Property Management) ou issu d'une adjudication de marché.
// Pas de colonne Inactif ni de FK Building - registre au niveau société, comme
// dans RMANew (aucune logique de suppression protégée trouvée sur Fournisseur).
public class Prestataire : Base
{
    public string Designation { get; set; } = null!;
    public string Activite { get; set; } = null!;
    public string TypePrestataire { get; set; } = null!;
    public string Enseigne { get; set; } = null!;
    public string Rc { get; set; } = null!;
    public string Idf { get; set; } = null!;
    public string Ice { get; set; } = null!;
    public string Adresse { get; set; } = null!;
    public string PostalCode { get; set; } = null!;
    public int? NoVille { get; set; }
    public string Pays { get; set; } = null!;
    public string Notes { get; set; } = null!;
}

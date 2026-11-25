namespace Design.Contract.Requests;

// RMANew (ListAmortissement.vb, ImporterAmortissement) : import brut, sans recalcul -
// les champs d'amortissement (Taux/Durée/Normaux/Anterieurs/Total) sont repris tels quels
// du fichier, contrairement à la saisie manuelle (TableauAmortissementRequest) qui les
// calcule côté serveur depuis la Typologie. Designation/ImmobilisationConcernee sont
// résolues par nom vers Building/TypologieImmobilisation existants - RMANew crée une
// ligne de référence vide quand le nom n'existe pas encore, ce qui n'est pas repris ici
// (trop permissif : mieux vaut rejeter la ligne et le signaler que semer des lignes de
// référence incomplètes).
public class TableauAmortissementImportRow
{
    public required string Designation { get; set; }
    public required string ImmobilisationConcernee { get; set; }

    public DateTime? DateEntree { get; set; }
    public decimal VaPrixAcquisition { get; set; }

    public decimal AmortiAnterieurs { get; set; }
    public decimal AmortiDbeneficebTaux { get; set; }
    public int AmortiDbenficebDuree { get; set; }
    public decimal AmortiDbeneficebNorm { get; set; }
    public decimal TotalAmortiAlaFin { get; set; }
}

public class TableauAmortissementImportRequest
{
    public int? AddUser { get; set; }
    public required List<TableauAmortissementImportRow> Rows { get; set; }
}

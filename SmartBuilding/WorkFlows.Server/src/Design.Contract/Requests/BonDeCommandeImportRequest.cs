namespace Design.Contract.Requests;

// RMANew (ImportBonDeCommande.vb) : import brut depuis Excel. Fournisseur est résolu par
// nom (Designation) vers un Prestataire existant - contrairement à RMANew qui crée
// silencieusement un Fournisseur vide quand le nom ne correspond à rien, une ligne sans
// correspondance est ici rejetée et signalée (voir BonDeCommandeService.ImportAsync) :
// le Prestataire de Smart-Building a trop de champs obligatoires (Rc/Ice/Adresse...) pour
// qu'une création à la volée avec juste un nom produise un enregistrement exploitable.
public class BonDeCommandeImportRow
{
    public required string NumeroBonCommande { get; set; }
    public required string NomFournisseur { get; set; }
    public DateTime DateCommande { get; set; }
    public DateTime? DateReception { get; set; }
    public string? Compte { get; set; }
    public string? CompteComptable { get; set; }
    public string? StatutApprobation { get; set; }
}

public class BonDeCommandeImportRequest
{
    public int? AddUser { get; set; }
    public required List<BonDeCommandeImportRow> Rows { get; set; }
}

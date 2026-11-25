namespace Design.Contract.Requests;

// RMANew (Classes/ListEncaissement.vb, Importer()) : "update Bordereau set NumRemiseBancaire
// = @NumRemiseBancaire where RefPaiement = @RefPaiement" pour chaque ligne du fichier importé.
public class ImporterRemiseLigne
{
    public required string RefPaiement { get; set; }
    public required string NumRemiseBancaire { get; set; }
}

public class ImporterRemiseRequest
{
    public required List<ImporterRemiseLigne> Lignes { get; set; }
}

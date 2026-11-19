namespace Design.Contract.Responses;

// RMANew (Classes/ListEncaissement.vb, GenereEncaissement) : une ligne par encaissement non
// encore exporté, au format fixe attendu par l'intégration comptable externe - les colonnes
// et plusieurs valeurs (Nature, Direction, Code service, etc.) sont des codes internes fixes
// du legacy, reproduits tels quels faute de documentation sur leur signification exacte.
public class RapportComptableLigneResponse
{
    public string DateComptable { get; init; } = null!;
    public string Type { get; init; } = null!;
    public string CodeIntermediaire { get; init; } = "";
    public string NomPayeur { get; init; } = null!;
    public string LibelleOperation { get; init; } = "";
    public string Montant { get; init; } = null!;
    public string DateEncaissVirChequeEffet { get; init; } = null!;
    public string ReferencePaiement { get; init; } = null!;
    public string BanqueVirementVersement { get; init; } = "";
    public string VilleCheque { get; init; } = "";
    public string CompteChequeEffetVirt { get; init; } = "";
    public string Nature { get; init; } = "9";
    public string Direction { get; init; } = "900";
    public string CodeService { get; init; } = "W3426";
    public string ComptePieceComptable { get; init; } = "";
    public string SousComptePieceComptable { get; init; } = "";
    public string BanqueVersementChequeEffetVirt { get; init; } = "";
    public string Agence { get; init; } = "";
    public string ComptevermtChqEffetVir { get; init; } = "";
    public string LettrageCompensation { get; init; } = "";
    public string RefBx { get; init; } = "";
    public string NomEncaisseur { get; init; } = "";
    public string NumRemiseBancaire { get; init; } = "";
}

public class RapportComptableResponse
{
    public List<RapportComptableLigneResponse> Lignes { get; init; } = [];
}

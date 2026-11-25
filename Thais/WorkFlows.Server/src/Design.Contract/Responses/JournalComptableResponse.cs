namespace Design.Contract.Responses;

public class JournalComptableLigneResponse
{
    public int JrnlLineNbr { get; set; }
    public DateTime EffDate { get; set; }
    public int NoBuilding { get; set; }
    public string? Immeuble { get; set; }
    public string? Centre { get; set; } // CodeImmeuble
    public string? Catmin { get; set; } // NAffectation
    public string? Compte { get; set; }
    public string? SousCompte { get; set; }
    public decimal TransAmt { get; set; }
    public string SensDrCr { get; set; } = null!; // D / C
    public string? Descp { get; set; }
}

public class JournalComptableResponse
{
    public string TypeJournal { get; set; } = null!;
    public int Annee { get; set; }
    public int Mois { get; set; }
    public int? NoProprietaire { get; set; }

    public List<JournalComptableLigneResponse> Lignes { get; set; } = [];
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }

    // Comptes manquants dans CompteComptableJournal pour ce type/TypeSéquenceComptable -
    // ces immeubles n'ont pas pu générer de ligne (à corriger dans la configuration).
    public List<string> ImmeublesSansCompte { get; set; } = [];
}

public class JournalComptableGenerationResponse
{
    public int Numero { get; set; }
    public int Annee { get; set; }
    public int Mois { get; set; }
    public int? NoProprietaire { get; set; }
    public string? Proprietaire { get; set; }
    public string TypeJournal { get; set; } = null!;
    public DateTime DateGeneration { get; set; }
    public int GenerePar { get; set; }
    public int NbLignes { get; set; }
    public decimal MontantTotal { get; set; }
}

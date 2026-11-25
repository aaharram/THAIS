namespace Design.Contract.Responses;

public class SinistreResponse
{
    public int Numero { get; init; }
    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }
    public int? NoLocal { get; init; }
    public string? NomLocal { get; init; }
    public int? NoAssurance { get; init; }
    public string? NumPoliceAssurance { get; init; }
    public int NoTypeSinistre { get; init; }
    public string? NomTypeSinistre { get; init; }

    public string EtapeSuivi { get; init; } = null!;
    public DateTime? DateDeclaration { get; init; }
    public DateTime? DateExpertise { get; init; }
    public DateTime? DateReclamation { get; init; }
    public DateTime? DateRemboursement { get; init; }

    public decimal? EstimationDegatBailleur { get; init; }
    public decimal? EstimationDegatLocataire { get; init; }
    public decimal? MontantFacture { get; init; }
    public decimal? MontantRemuneration { get; init; }

    public int? Cumul { get; init; }
    public string? NomExpert { get; init; }
    public string? RefDossierAssurance { get; init; }
    public string? IdSinistre { get; init; }
    public string? Notes { get; init; }

    public string? NoSinistre { get; init; }
    public string? AgentAyantReclame { get; init; }
    public string? CompteurFicheIntervention { get; init; }
    public string? ReferenceDossierDAG { get; init; }
    public decimal? MontantExpert { get; init; }
    public string? ReferenceFacture { get; init; }
    public string? ObjetReclamation { get; init; }
    public string? Site { get; init; }

    public string? CheminExpertiseLocataire { get; init; }
    public string? CheminExpertiseBailleur { get; init; }
    public string? CheminPVExpertise { get; init; }

    // Colonnes calculées pour la liste (ListSinistre.aspx) - locataire actuel du Local,
    // et libellés Assureur/Courtier résolus via Assurance.
    public string? NomLocataire { get; init; }
    public string? NomAssureur { get; init; }
    public string? NomCourtier { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

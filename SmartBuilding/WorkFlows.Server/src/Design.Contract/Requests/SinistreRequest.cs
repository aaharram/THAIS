namespace Design.Contract.Requests;

public class SinistreRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoBuilding { get; set; }
    public int? NoLocal { get; set; }
    public int? NoAssurance { get; set; }
    public required int NoTypeSinistre { get; set; }

    public string? EtapeSuivi { get; set; }
    public DateTime? DateDeclaration { get; set; }
    public DateTime? DateExpertise { get; set; }
    public DateTime? DateReclamation { get; set; }
    public DateTime? DateRemboursement { get; set; }

    public decimal? EstimationDegatBailleur { get; set; }
    public decimal? EstimationDegatLocataire { get; set; }
    public decimal? MontantFacture { get; set; }
    public decimal? MontantRemuneration { get; set; }

    public int? Cumul { get; set; }
    public string? NomExpert { get; set; }
    public string? RefDossierAssurance { get; set; }
    public string? Notes { get; set; }

    public string? NoSinistre { get; set; }
    public string? AgentAyantReclame { get; set; }
    public string? CompteurFicheIntervention { get; set; }
    public string? ReferenceDossierDAG { get; set; }
    public decimal? MontantExpert { get; set; }
    public string? ReferenceFacture { get; set; }
    public string? ObjetReclamation { get; set; }
    public string? Site { get; set; }

    // CheminExpertiseLocataire/Bailleur/PVExpertise ne sont pas ici : ce sont des pièces
    // jointes (fichiers), gérées par les endpoints dédiés POST/GET
    // /api/sinistres/{id}/attachment/{kind} - même principe que ProfileController pour
    // la photo de profil.
}

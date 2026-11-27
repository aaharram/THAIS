namespace Design.Contract.Responses;

public class FactureResponse
{
    public int Numero { get; init; }
    // RMANew (ListFacture) : « Référence de Facture » = <propriétaire>/<année>/00<n° d'ordre dans l'année>
    public string? Reference { get; init; }
    public int NoLocation { get; init; }
    public string? NumContratLocations { get; init; }
    public string? NomLocataire { get; init; }
    public string? NomBuilding { get; init; }
    public string? NomLocal { get; init; }
    public string? NomProprietaire { get; init; } // RMANew (Listetatannulationquittance.vb) : colonne "Entite"
    // RMANew (JournalLoyer.vb) : colonnes du journal — N° locataire, Cpte Général (actif), Etage et App N° (local).
    public int? NoBuilding { get; init; }
    public int? NoProprietaire { get; init; }
    public string? CodeLocataire { get; init; }
    public string? CompteGeneral { get; init; }
    public string? Etage { get; init; }

    public DateTime Periode { get; init; }
    public DateTime DateEmission { get; init; }
    public DateTime? DateEcheance { get; init; }

    public decimal? LoyerNet { get; init; }
    public decimal? Charges { get; init; }
    public decimal? TVA { get; init; }
    public decimal? Taxe { get; init; }
    public decimal? Autres { get; init; }
    public decimal Montant { get; init; }
    public string TypeFacture { get; init; } = null!;

    public string Etat { get; init; } = null!;
    public bool Edite { get; init; }
    public bool DemandeAnnulation { get; init; }
    public DateTime? DateAnnulation { get; init; }
    public string? Notes { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

namespace Design.Contract.Responses;

// RMANew (ViewReporting.aspx "Etat des Nouveaux Baux" -> Classes/ListNouveauxBaux.vb) :
// baux signés dans l'année en cours.
public class NouveauBailResponse
{
    public int Numero { get; init; }
    public string? NomBuilding { get; init; } // "Actif"
    public DateTime? DateDebut { get; init; } // "Date du bail"
    public string? NomLocataire { get; init; }
    public string? Usage { get; init; } // typologie de l'actif (BuildingType)
    public string? Etage { get; init; } // "Niveau"
    public decimal? LoyerMensuel { get; init; } // Bail.Montant
    public decimal CumulMontant { get; init; } // somme des factures non annulées de ce bail
    public string? NumContratLocations { get; init; } // "Contrat"
    public string? NomLocal { get; init; }
    public decimal? Superficie { get; init; }
    public decimal? LoyerDeBase { get; init; } // LoyerNet + Autres
    public DateTime? DateFin { get; init; }
    public DateTime? DateRevision { get; init; } // dernière révision connue
    public DateTime? DateProchaineRevision { get; init; }
}

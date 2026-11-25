namespace Design.Contract.Responses;

// RMANew (ViewPageEtatdesactifs.vb, "Liste Locaux vacants") : un Local actif, non inactif,
// sans bail en cours (RMANew utilise Local.Occupation, absent du nouveau schéma - remplacé
// par l'absence de Bail avec Etat="En cours de location").
public class LocalVacantResponse
{
    public int Numero { get; init; }
    public string? NomProprietaire { get; init; } // "Entité"
    public string? NomBuilding { get; init; } // "Actif"
    public string NomLocal { get; init; } = null!; // "Local"
    public string? Etage { get; init; }
    public decimal? Superficie { get; init; }
    public string? Adresse { get; init; }
}

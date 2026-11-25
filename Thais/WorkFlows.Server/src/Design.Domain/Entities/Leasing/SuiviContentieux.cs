using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

// RMANew (ListSuiviJuridique.aspx / Classes/ListSuiviJuridique.vb, table SuiviContentieux) :
// dossier de contentieux locatif rattaché à un bail. Le legacy lie aussi des sous-entités
// Avocat/Audience/Jugement (leurs propres ListAvocat.aspx/ListAudience.aspx/ListJugement.aspx,
// CRUD complets et distincts) via NoContentieux. Avocat est repris (voir Avocat.cs) ;
// Audience/Jugement suivent le même schéma mais restent hors périmètre.
public class SuiviContentieux : Base
{
    // RMANew (DataEntrySuiviJuridique.vb) : ce formulaire n'a aucun champ Bail, ni en
    // création ni en édition - NoLocation n'y est jamais lu ni écrit. Nullable ici pour
    // reproduire fidèlement ce comportement plutôt que de l'imposer artificiellement.
    public int? NoLocation { get; set; }

    public string? NatureProcedure { get; set; } // multi-ligne côté RMANew
    public string? Observation { get; set; } // "Suivi" - journal du dossier
    public string? Description { get; set; } // champ distinct de "Suivi", vu dans DataEntrySuiviJuridique.aspx

    // RMANew (StatutDossier, codes 1-5 : Nouveau/En Contentieux/Dossier jugé/Accord
    // amiable/Non Contentieux) : le formulaire d'édition (DataEntrySuiviJuridique.aspx)
    // n'expose que 2 choix (En Contentieux / Non Contentieux) - les 3 autres valeurs sont
    // affichées par la liste mais ne semblent atteignables que par d'autres voies du
    // legacy (ex. via le sous-système Jugement) que ce périmètre ne reprend pas.
    public string StatutDossier { get; set; } = "Nouveau";

    public DateTime? DateDebutContentieux { get; set; }
    public DateTime? DateEncaissement { get; set; }
    public decimal? MontantEncaisse { get; set; }
    public decimal? SoldeAnneePrecedente { get; set; }
    public string? PieceJointe { get; set; }
}

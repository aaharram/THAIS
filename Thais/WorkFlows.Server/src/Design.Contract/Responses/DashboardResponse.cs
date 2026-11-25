namespace Design.Contract.Responses;

// RMANew (Classes/DataEntryLeasing.vb) : les indicateurs du Tableau de bord, tous
// recalculés selon les 4 filtres (Propriétaire / Ville / Typologie de local / Actif).
public class DashboardResponse
{
    // "Patrimoine Géré" - Immeubles() et lots().
    public int NbActifs { get; init; }
    public int NbLocaux { get; init; }

    // "Loyer prévisionnel annuel" - TotauxLoyers() : loyer des baux actifs et quittancés,
    // annualisé selon la périodicité (mensuelle x12, trimestrielle x4, annuelle x1).
    public decimal LoyerPrevisionnelAnnuel { get; init; }

    // "Budget de charge" - Budgets() : SUM(Charge.Montant) de l'année en cours.
    public decimal BudgetCharge { get; init; }

    // "Taux d'occupation" - LotOccupéGlobal().
    public decimal TauxOccupation { get; init; }

    // "Réalisation" - ChargesR() et TauxRealisation().
    public decimal MontantRealisation { get; init; }
    public decimal TauxRealisation { get; init; }

    // "Rendement" - Rendement() : loyers annuels des actifs valorisés / somme de leur
    // valeur d'entrée.
    public decimal Rendement { get; init; }

    // "Encaissements" - Encaissements() et TauxEncaissement().
    public decimal MontantEncaissements { get; init; }
    public decimal TauxEncaissement { get; init; }

    // "Décaissement" - FacturesPrestataire() et GetTauxDecaissement().
    public decimal MontantDecaissement { get; init; }
    public decimal TauxDecaissement { get; init; }

    // "Quittancés vs Encaissés" - GetComparatifLoyers() : les 6 derniers mois.
    public List<DashboardMoisResponse> QuittancesVsEncaisses { get; init; } = [];

    // Détail des locaux (infobulle de la façade) : occupés d'abord, puis vacants.
    public List<DashboardLocalResponse> Locaux { get; init; } = [];
}

public class DashboardLocalResponse
{
    public int Numero { get; init; }
    public string Designation { get; init; } = null!;
    public string? Actif { get; init; }
    public string? Type { get; init; }
    public string? Etage { get; init; }
    public decimal? Surface { get; init; }
    public bool Occupe { get; init; }
    public string? Locataire { get; init; }
    public decimal? Loyer { get; init; }
}

public class DashboardMoisResponse
{
    public int Annee { get; init; }
    public int Mois { get; init; }
    public string Libelle { get; init; } = null!;
    public decimal Quittance { get; init; }
    public decimal Encaisse { get; init; }
}

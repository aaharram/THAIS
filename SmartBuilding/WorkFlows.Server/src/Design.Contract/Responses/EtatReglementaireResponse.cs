namespace Design.Contract.Responses;

public class EtatReglementaireLigneResponse
{
    public int NoBuilding { get; set; }
    public string? CodeImmeuble { get; set; }
    public string? TitreFoncier { get; set; }
    public string? Designation { get; set; }

    public decimal ValeurEntree { get; set; }
    public decimal AmortissementCumule { get; set; }
    public decimal ValeurInventaire { get; set; }
    public decimal? ValeurRealisation { get; set; }
    public decimal MoinsValueGlobale { get; set; }

    // Répartition réglementaire de la Valeur d'inventaire selon l'affectation de l'actif
    // (une seule colonne non nulle par ligne - format imposé par la déclaration D21/D05).
    public decimal Vie { get; set; }
    public decimal NonVie { get; set; }
    public decimal Gsr { get; set; }
    public decimal Autres { get; set; }

    // D05 uniquement (revenus locatifs annualisés) - null pour D21.
    public decimal? RevenusLocatifs { get; set; }
}

public class EtatReglementaireResponse
{
    public string Type { get; set; } = null!; // D21 / D05

    public List<EtatReglementaireLigneResponse> Lignes { get; set; } = [];

    public decimal TotalValeurEntree { get; set; }
    public decimal TotalAmortissementCumule { get; set; }
    public decimal TotalValeurInventaire { get; set; }
    public decimal TotalValeurRealisation { get; set; }
    public decimal TotalVie { get; set; }
    public decimal TotalNonVie { get; set; }
    public decimal TotalGsr { get; set; }
    public decimal TotalAutres { get; set; }
    public decimal? TotalRevenusLocatifs { get; set; }
}

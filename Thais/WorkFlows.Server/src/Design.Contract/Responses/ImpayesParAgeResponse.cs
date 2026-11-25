namespace Design.Contract.Responses;

public class ImpayesParAgeBuildingResponse
{
    public int NoBuilding { get; set; }
    public string? Immeuble { get; set; }
    public string? CodeImmeuble { get; set; }

    public decimal MoinsDe3Mois { get; set; }
    public decimal Entre3Et6Mois { get; set; }
    public decimal Entre6MoisEt1An { get; set; }
    public decimal PlusDe12Mois { get; set; }
    public decimal Total { get; set; }

    public decimal ProvisionDouteux { get; set; }
    public decimal ProvisionContentieux { get; set; }
    public decimal TotalProvision { get; set; }
}

public class ImpayesParAgeResponse
{
    public List<ImpayesParAgeBuildingResponse> Buildings { get; set; } = [];

    public decimal TotalMoinsDe3Mois { get; set; }
    public decimal TotalEntre3Et6Mois { get; set; }
    public decimal TotalEntre6MoisEt1An { get; set; }
    public decimal TotalPlusDe12Mois { get; set; }
    public decimal TotalGeneral { get; set; }
    public decimal TotalProvisionDouteux { get; set; }
    public decimal TotalProvisionContentieux { get; set; }
    public decimal TotalProvision { get; set; }
}

using Design.Domain.Common;

namespace Design.Domain.Entities.Configuration;

public class TypologieImmobilisation : Base
{
    public string ImmobilisationConcernee { get; set; } = null!;
    public string? CompteComptable { get; set; }
    public string? CompteAmortissement { get; set; }
    public string? CompteDotation { get; set; }
    public decimal? Taux { get; set; }
    public int? Duree { get; set; }
}

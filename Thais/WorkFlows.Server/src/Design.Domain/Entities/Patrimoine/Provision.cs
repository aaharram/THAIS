using Design.Domain.Common;

namespace Design.Domain.Entities.Patrimoine;

public class Provision : Base
{
    public int NoBuilding { get; set; }
    public decimal? MontantProvision { get; set; }
    public DateTime? DateProvision { get; set; }
}

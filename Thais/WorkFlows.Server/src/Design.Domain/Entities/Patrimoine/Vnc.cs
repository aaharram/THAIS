using Design.Domain.Common;

namespace Design.Domain.Entities.Patrimoine;

public class Vnc : Base
{
    public int NoBuilding { get; set; }
    public decimal? MontantVNC { get; set; }
    public DateTime? DateVNC { get; set; }
}

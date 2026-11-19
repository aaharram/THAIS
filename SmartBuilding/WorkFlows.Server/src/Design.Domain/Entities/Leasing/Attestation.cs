using Design.Domain.Common;

namespace Design.Domain.Entities.Leasing;

public class Attestation : Base
{
    public int NoLocation { get; set; } // FK vers Bail (Location) = "Contrat"
    public int NoLocataire { get; set; } // "Client", dérivé du bail

    public string TypeAttestation { get; set; } = "Attestation regularité fiscal";
    public DateTime? DateAttestation { get; set; }
    public DateTime? DateDebut { get; set; }
    public DateTime? DateFin { get; set; }

    public bool Inactif { get; set; }
}

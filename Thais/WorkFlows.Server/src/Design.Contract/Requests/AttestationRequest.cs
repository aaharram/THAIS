namespace Design.Contract.Requests;

public class AttestationRequest
{
    public int? AddUser { get; set; }
    public int? ModUser { get; set; }

    public required int NoLocation { get; set; }
    public required int NoLocataire { get; set; }

    public string TypeAttestation { get; set; } = "Attestation regularité fiscal";
    public DateTime? DateAttestation { get; set; }
    public DateTime? DateDebut { get; set; }
    public DateTime? DateFin { get; set; }

    public bool Inactif { get; set; }
}

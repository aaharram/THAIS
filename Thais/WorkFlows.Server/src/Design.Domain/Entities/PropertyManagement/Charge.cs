using Design.Domain.Common;

namespace Design.Domain.Entities.PropertyManagement;

// RMANew (DataEntryChargePrevues.vb / DataEntryChargesReelles.vb) : une seule table
// "Charge" porte à la fois le budget prévu (Montant) et le réalisé (Realisation) - ce
// sont deux écrans du legacy sur la même ligne, pas deux entités. Le verrou legacy
// (Montant prévu figé une fois une génération annuelle "OrdreGenerationCharges" lancée)
// n'est pas reproduit : c'est un mécanisme de traitement par lot, hors du périmètre ici.
public class Charge : Base
{
    public int NoBuilding { get; set; }
    public int NoTypologieCharge { get; set; }
    public int? NoPrestataire { get; set; }

    public int Annee { get; set; }
    public decimal? Montant { get; set; } // prévu
    public decimal? Realisation { get; set; } // réel
    public DateTime? DateDecaissement { get; set; }
    public string? CodeCharge { get; set; } // auto "CH{Numero}" après le premier save
    public string? Notes { get; set; }

    public bool Inactif { get; set; }
}

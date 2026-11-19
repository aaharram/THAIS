namespace Design.Contract.Requests;

// Import Excel des baux (THAIS) : une ligne = un locataire dans un actif, avec ses dates de bail.
// Même disposition que le fichier de CFC « Dates début et fin des baux » (une ligne par locataire).
public class BailImportRowRequest
{
    public string Locataire { get; set; } = string.Empty;
    public string Actif { get; set; } = string.Empty; // colonne « Building » du fichier
    public decimal? Surface { get; set; }
    public int Parking { get; set; }
    public DateTime? DateDebut { get; set; } // date de prise d'effet du bail
    public DateTime? DateGestion { get; set; } // date à partir de laquelle la durée est comptabilisée
    public string? DureeContrat { get; set; }
    public string? Preavis { get; set; }
    public DateTime? DateFin { get; set; }
}

public class BailImportRequest
{
    public List<BailImportRowRequest> Lignes { get; set; } = [];
    public int? AddUser { get; set; }
}

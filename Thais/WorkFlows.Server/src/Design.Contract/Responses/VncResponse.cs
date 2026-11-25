namespace Design.Contract.Responses;

public class VncResponse
{
    public int Numero { get; init; }

    public int NoBuilding { get; init; }
    public string? NomBuilding { get; init; }

    public decimal? MontantVNC { get; init; }
    public DateTime? DateVNC { get; init; }

    public int? AddUser { get; init; }
    public DateTime AddDate { get; init; }
    public int? ModUser { get; init; }
    public DateTime ModDate { get; init; }
}

// Une ligne par Actif : la dernière VNC + le nombre de versions, comme RMANew
// (ListVNCParActif.GenerateTable).
public class VncSummaryResponse
{
    public int NoBuilding { get; init; }
    public string CodeImmeuble { get; init; } = null!;
    public string NomBuilding { get; init; } = null!;
    public string? Adresse { get; init; }
    public string? Affectation { get; init; }
    public string? Usage { get; init; }
    public decimal? ValeurBrut { get; init; }
    public decimal? DerniereVnc { get; init; }
    public DateTime? DateDerniereVnc { get; init; }
    public int NombreVersions { get; init; }
    public int NombreProvisions { get; init; }
}

namespace Design.Contract.Requests;

// Import Excel des listes de données de base (THAIS). Le fichier est lu côté client : le serveur ne reçoit
// que les lignes déjà contrôlées et les revalide (une ligne en erreur est ignorée, pas bloquante).
public class ImportRequest<TRow>
{
    public List<TRow> Lignes { get; set; } = [];
    public int? AddUser { get; set; }
}

public class LocalImportRow
{
    public string Actif { get; set; } = string.Empty; // désignation ou code de l'actif (doit exister)
    public string Designation { get; set; } = string.Empty; // nom du local
    public string? TypeLocal { get; set; } // typologie de local (doit exister si renseignée)
    public string? Etage { get; set; }
    public decimal? Surface { get; set; }
    public int? NbrePiece { get; set; }
    public string? TitreFoncier { get; set; }
    public string? Adresse { get; set; }
    public string? Description { get; set; }
}

public class BuildingImportRow
{
    public string CodeImmeuble { get; set; } = string.Empty; // code analytique
    public string Designation { get; set; } = string.Empty;
    public string? Typologie { get; set; } // type d'actif (doit exister si renseigné)
    public string? TitreFoncier { get; set; }
    public string? Ville { get; set; } // doit exister si renseignée
    public string? Adresse { get; set; }
    public decimal? SurfaceUtile { get; set; }
    public string? Proprietaire { get; set; } // doit exister si renseigné
}

public class LocataireImportRow
{
    public string? RaisonSociale { get; set; } // renseignée = personne morale ; sinon Nom obligatoire
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Ice { get; set; }
    public string? Rc { get; set; }
    public string? IdentifiantFiscal { get; set; }
    public string? Cin { get; set; }
    public string? Telephone { get; set; }
    public string? Email { get; set; }
    public string? Adresse { get; set; }
    public string? Ville { get; set; } // doit exister si renseignée
    public string? CodeLocataire { get; set; }
}

public class FilialeImportRow
{
    public string Nom { get; set; } = string.Empty;
    public string? NumeroReference { get; set; }
    public DateTime? Date { get; set; }
    public string? Rib { get; set; }
    public string? Banque { get; set; } // doit exister si renseignée
    public string? ModeReglement { get; set; }
}

public class TypologieChargeImportRow
{
    public string Typologie { get; set; } = string.Empty;
    public string? Compte { get; set; }
    public string? Description { get; set; }
}

// Listes de référence génériques (villes, banques, types d'actif…) : désignation (+ « accès complet » pour les profils).
public class LookupImportRow
{
    public string Designation { get; set; } = string.Empty;
    public bool? AccesComplet { get; set; }
}

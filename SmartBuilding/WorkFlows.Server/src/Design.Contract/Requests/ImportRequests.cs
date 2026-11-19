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

// ------------------------------------------------------------------ Property Management
public class PrestataireImportRow
{
    public string Designation { get; set; } = string.Empty;
    public string? Activite { get; set; }
    public string? TypePrestataire { get; set; }
    public string? Enseigne { get; set; }
    public string? Rc { get; set; }
    public string? Idf { get; set; }
    public string? Ice { get; set; }
    public string? Adresse { get; set; }
    public string? CodePostal { get; set; }
    public string? Ville { get; set; } // doit exister si renseignée
    public string? Pays { get; set; }
    public string? Notes { get; set; }
}

public class AssuranceImportRow
{
    public string? NumPolice { get; set; }
    public string Assureur { get; set; } = string.Empty; // doit exister
    public string? Courtier { get; set; } // doit exister si renseigné
    public string? TypeCouverture { get; set; }
    public DateTime? DateEffetContrat { get; set; }
    public decimal? Montant { get; set; }
    public string? Statut { get; set; } // EnCours (défaut) ou Terminé
    public string? Notes { get; set; }
}

public class ChargeImportRow
{
    public string Actif { get; set; } = string.Empty; // désignation ou code de l'actif (doit exister)
    public string Typologie { get; set; } = string.Empty; // typologie de charge (doit exister)
    public string? Prestataire { get; set; } // doit exister si renseigné
    public int? Annee { get; set; }
    public decimal? Montant { get; set; } // prévu
    public decimal? Realisation { get; set; } // réel
    public DateTime? DateDecaissement { get; set; }
    public string? Notes { get; set; }
}

public class TaxeImportRow
{
    public string Actif { get; set; } = string.Empty; // désignation ou code de l'actif (doit exister)
    public string? Local { get; set; } // nom du local dans cet actif (doit exister si renseigné)
    public string? Locataire { get; set; } // raison sociale ou « nom prénom » (doit exister si renseigné)
    public string TypeTaxe { get; set; } = string.Empty; // doit exister
    public string? IdFiscal { get; set; }
    public string? NoArticle { get; set; }
    public decimal? MontantTaxe { get; set; }
    public int? Annee { get; set; }
    public bool? Paye { get; set; }
    public string? Notes { get; set; }
}

public class SyndicImportRow
{
    public string Nom { get; set; } = string.Empty;
    public string? Prenom { get; set; }
    public string? Poste { get; set; }
    public string? Telephone { get; set; }
    public DateTime? DebutMandat { get; set; }
    public DateTime? FinMandat { get; set; }
    public string? Notes { get; set; }
}

public class TypologieImmobilisationImportRow
{
    public string ImmobilisationConcernee { get; set; } = string.Empty;
    public string? CompteComptable { get; set; }
    public string? CompteAmortissement { get; set; }
    public string? CompteDotation { get; set; }
    public decimal? Taux { get; set; } // % entre 0 et 100
    public int? Duree { get; set; }
}

public class ContratPrestataireImportRow
{
    public string Prestataire { get; set; } = string.Empty; // doit exister
    public string? Objet { get; set; }
    public DateTime? DateContrat { get; set; }
    public DateTime? DateDebut { get; set; }
    public DateTime? DateFin { get; set; }
    public decimal? Montant { get; set; }
    public string? Notes { get; set; }
}

public class BonCommandeImportRow
{
    public string? NumeroBonCommande { get; set; }
    public string Prestataire { get; set; } = string.Empty; // doit exister
    public DateTime? DateCommande { get; set; }
    public DateTime? DateReception { get; set; }
    public string? Compte { get; set; }
    public string? CompteComptable { get; set; }
    public string? StatutApprobation { get; set; } // En attente (défaut), Approuvé ou Rejeté
    public string? Notes { get; set; }
}

public class PrestationAchatImportRow
{
    public string? NumeroBonCommande { get; set; } // doit exister
    public string Actif { get; set; } = string.Empty; // désignation ou code de l'actif (doit exister)
    public string Typologie { get; set; } = string.Empty; // typologie de charge (doit exister)
    public decimal? PrixUnitaireHt { get; set; }
    public decimal? Quantite { get; set; } // 1 par défaut
    public decimal? TauxTva { get; set; }
    public int? DureeAmortissementMois { get; set; }
    public decimal? TauxAmortissement { get; set; }
    public string? Notes { get; set; }
}

public class ReclamationImportRow
{
    public string Actif { get; set; } = string.Empty; // désignation ou code de l'actif (doit exister)
    public string? Local { get; set; } // nom du local dans cet actif (doit exister si renseigné)
    public string Locataire { get; set; } = string.Empty; // raison sociale ou « nom prénom » (doit exister)
    public string? Etat { get; set; } // Ouverte (défaut), En traitement, Résolue ou Fermée
    public DateTime? DateReclamation { get; set; }
    public string? Objet { get; set; }
    public string? Notes { get; set; }
}

public class SinistreImportRow
{
    public string Actif { get; set; } = string.Empty; // désignation ou code de l'actif (doit exister)
    public string? Local { get; set; } // nom du local dans cet actif (doit exister si renseigné)
    public string? NumPolice { get; set; } // police d'assurance (doit exister si renseignée)
    public string TypeSinistre { get; set; } = string.Empty; // doit exister
    public string? EtapeSuivi { get; set; } // Déclaré (défaut), Expertise, Réclamation, Remboursement ou Clôturé
    public DateTime? DateDeclaration { get; set; }
    public DateTime? DateExpertise { get; set; }
    public DateTime? DateReclamation { get; set; }
    public DateTime? DateRemboursement { get; set; }
    public decimal? EstimationDegatBailleur { get; set; }
    public decimal? EstimationDegatLocataire { get; set; }
    public decimal? MontantFacture { get; set; }
    public decimal? MontantRemuneration { get; set; }
    public string? NomExpert { get; set; }
    public string? RefDossierAssurance { get; set; }
    public string? NoSinistre { get; set; }
    public string? Notes { get; set; }
}

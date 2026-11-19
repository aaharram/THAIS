using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Interfaces;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Configuration;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features;

// Import Excel des listes de données de base (THAIS). Principes communs :
//  - le fichier est lu côté client, le serveur revalide chaque ligne ;
//  - une ligne en erreur est ignorée (et signalée), les autres sont importées ;
//  - un élément déjà présent est ignoré, ce qui rend l'import rejouable sans doublons ;
//  - tout est enregistré dans une seule transaction : une erreur imprévue n'enregistre rien.
public class ImportService(DbDesignContext context, ILogger<ImportService> logger) : IImportService
{
    private const int MaxLignes = 2000;

    private static string Cle(string? s) => (s ?? string.Empty).Trim().ToLowerInvariant();

    private static string? Net(string? s)
    {
        string? t = s?.Trim();
        return string.IsNullOrEmpty(t) ? null : t;
    }

    private static Dictionary<string, T> Index<T>(IEnumerable<T> items, Func<T, string?> key)
    {
        Dictionary<string, T> d = [];
        foreach (T item in items)
        {
            string k = Cle(key(item));
            if (k.Length > 0)
            {
                d.TryAdd(k, item);
            }
        }

        return d;
    }

    // Longueur maximale d'une colonne d'après le modèle EF : évite une erreur SQL en cours d'import.
    private string? TropLong<TEntity>(string property, string? value, string libelle) where TEntity : class
    {
        if (value is null)
        {
            return null;
        }

        int? max = context.Model.FindEntityType(typeof(TEntity))?.FindProperty(property)?.GetMaxLength();
        return max is not null && value.Length > max ? $"{libelle} trop long ({value.Length} caractères, maximum {max})." : null;
    }

    private static string? PremierProbleme(params string?[] problemes) => problemes.FirstOrDefault(p => p is not null);

    private async Task<ImportResultResponse> ExecuterAsync<TRow>(ImportRequest<TRow> request, Func<TRow, string?> traiter, Func<TRow, string> libelle)
    {
        if (request.Lignes.Count == 0)
        {
            throw new ArgumentException("Aucune ligne à importer.");
        }

        if (request.Lignes.Count > MaxLignes)
        {
            throw new ArgumentException($"Trop de lignes (maximum {MaxLignes} par import).");
        }

        List<ImportIssueResponse> ignorees = [];
        int crees = 0;

        await using var transaction = await context.Database.BeginTransactionAsync();
        for (int i = 0; i < request.Lignes.Count; i++)
        {
            TRow ligne = request.Lignes[i];
            string? probleme = traiter(ligne);
            if (probleme is null)
            {
                crees++;
            }
            else
            {
                ignorees.Add(new ImportIssueResponse { Ligne = i + 1, Libelle = libelle(ligne), Message = probleme });
            }
        }

        await context.SaveChangesAsync();
        await transaction.CommitAsync();
        logger.LogInformation("Import {Type} : {Crees} créé(s), {Ignorees} ignoré(s).", typeof(TRow).Name, crees, ignorees.Count);
        return new ImportResultResponse { Crees = crees, Ignorees = ignorees };
    }

    // ---------------------------------------------------------------- Locaux
    public async Task<ImportResultResponse> ImportLocauxAsync(ImportRequest<LocalImportRow> request)
    {
        Dictionary<string, Building> actifs = Index(await context.Buildings.ToListAsync(), b => b.Designation);
        foreach (Building b in await context.Buildings.ToListAsync())
        {
            actifs.TryAdd(Cle(b.CodeImmeuble), b);
        }

        Dictionary<string, LocalType> types = Index(await context.LocalTypes.ToListAsync(), t => t.Designation);
        HashSet<(int, string)> existants = (await context.Locaux.Select(l => new { l.NoBuilding, l.Designation }).ToListAsync())
            .Select(l => (l.NoBuilding, Cle(l.Designation))).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, l =>
        {
            string? nom = Net(l.Designation);
            string? nomActif = Net(l.Actif);
            string? typeNom = Net(l.TypeLocal);
            string? etage = Net(l.Etage), titre = Net(l.TitreFoncier), adresse = Net(l.Adresse), description = Net(l.Description);

            string? probleme = PremierProbleme(
                nom is null ? "Nom du local manquant." : null,
                nomActif is null ? "Actif manquant." : null,
                l.Surface < 0 ? "Superficie négative." : null,
                l.NbrePiece < 0 ? "Nombre de pièces négatif." : null,
                TropLong<Local>(nameof(Local.Designation), nom, "Nom du local"),
                TropLong<Local>(nameof(Local.Etage), etage, "Étage"),
                TropLong<Local>(nameof(Local.TitreFoncier), titre, "Titre foncier"),
                TropLong<Local>(nameof(Local.Address1), adresse, "Adresse"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!actifs.TryGetValue(Cle(nomActif), out Building? actif))
            {
                return $"Actif introuvable : « {nomActif} » (créez-le ou importez-le d'abord).";
            }

            LocalType? type = null;
            if (typeNom is not null && !types.TryGetValue(Cle(typeNom), out type))
            {
                return $"Type de local inconnu : « {typeNom} » (Configuration > Données de référence > Typologies de lot).";
            }

            if (!existants.Add((actif.Numero, Cle(nom))))
            {
                return "Local déjà existant dans cet actif : ignoré.";
            }

            context.Locaux.Add(new Local
            {
                NoBuilding = actif.Numero,
                Designation = nom!,
                NoLocalType = type?.Numero,
                Etage = etage,
                Surface = l.Surface,
                NbrePiece = l.NbrePiece,
                TitreFoncier = titre,
                Address1 = adresse,
                Notes = description,
                EnExploitation = true,
                MettreEnLocation = true, // RMANew : un local ajouté est mis en location
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, l => l.Designation);
    }

    // ---------------------------------------------------------------- Actifs
    public async Task<ImportResultResponse> ImportActifsAsync(ImportRequest<BuildingImportRow> request)
    {
        List<Building> existants = await context.Buildings.ToListAsync();
        HashSet<string> codes = existants.Select(b => Cle(b.CodeImmeuble)).ToHashSet();
        HashSet<string> designations = existants.Select(b => Cle(b.Designation)).ToHashSet();
        Dictionary<string, Ville> villes = Index(await context.Villes.ToListAsync(), v => v.Designation);
        Dictionary<string, BuildingType> typologies = Index(await context.BuildingTypes.ToListAsync(), t => t.Designation);
        Dictionary<string, Proprietaire> proprietaires = Index(await context.Proprietaires.ToListAsync(), p => p.Designation);
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, b =>
        {
            string? code = Net(b.CodeImmeuble), designation = Net(b.Designation);
            string? typologie = Net(b.Typologie), ville = Net(b.Ville), proprietaire = Net(b.Proprietaire);
            string? titre = Net(b.TitreFoncier), adresse = Net(b.Adresse);

            string? probleme = PremierProbleme(
                code is null ? "Code analytique manquant." : null,
                designation is null ? "Désignation manquante." : null,
                b.SurfaceUtile < 0 ? "Superficie négative." : null,
                TropLong<Building>(nameof(Building.CodeImmeuble), code, "Code analytique"),
                TropLong<Building>(nameof(Building.Designation), designation, "Désignation"),
                TropLong<Building>(nameof(Building.TitreFoncier), titre, "Titre foncier"),
                TropLong<Building>(nameof(Building.Address1), adresse, "Adresse"));
            if (probleme is not null)
            {
                return probleme;
            }

            BuildingType? type = null;
            Ville? v = null;
            Proprietaire? p = null;
            if (typologie is not null && !typologies.TryGetValue(Cle(typologie), out type))
            {
                return $"Typologie inconnue : « {typologie} » (Configuration > Données de référence > Types Actif).";
            }

            if (ville is not null && !villes.TryGetValue(Cle(ville), out v))
            {
                return $"Ville inconnue : « {ville} » (Configuration > Données de référence > Villes).";
            }

            if (proprietaire is not null && !proprietaires.TryGetValue(Cle(proprietaire), out p))
            {
                return $"Propriétaire inconnu : « {proprietaire} » (Configuration > Données de référence > Propriétaires).";
            }

            if (codes.Contains(Cle(code)) || designations.Contains(Cle(designation)))
            {
                return "Actif déjà existant (même code ou même désignation) : ignoré.";
            }

            codes.Add(Cle(code));
            designations.Add(Cle(designation));
            context.Buildings.Add(new Building
            {
                CodeImmeuble = code!,
                Designation = designation!,
                EnExploitation = true,
                NAffectation = "N.A",
                NoBuildingType = type?.Numero,
                NoProprietaire = p?.Numero,
                NoCity = v?.Numero,
                TitreFoncier = titre,
                Address1 = adresse,
                SurfaceUtile = b.SurfaceUtile,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, b => b.Designation);
    }

    // ---------------------------------------------------------------- Locataires
    public async Task<ImportResultResponse> ImportLocatairesAsync(ImportRequest<LocataireImportRow> request)
    {
        List<Locataire> existants = await context.Locataires.ToListAsync();
        HashSet<string> deja = existants
            .Select(l => l.TypeLocataire == 1 ? Cle(l.DesignationEntreprise) : Cle($"{l.Nom} {l.Prenom}"))
            .Where(k => k.Length > 0).ToHashSet();
        Dictionary<string, Ville> villes = Index(await context.Villes.ToListAsync(), v => v.Designation);
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, l =>
        {
            string? raison = Net(l.RaisonSociale), nom = Net(l.Nom), prenom = Net(l.Prenom), ville = Net(l.Ville);
            string? ice = Net(l.Ice), rc = Net(l.Rc), idf = Net(l.IdentifiantFiscal), cin = Net(l.Cin);
            string? tel = Net(l.Telephone), email = Net(l.Email), adresse = Net(l.Adresse), code = Net(l.CodeLocataire);

            string? probleme = PremierProbleme(
                raison is null && nom is null ? "Raison sociale ou nom manquant." : null,
                email is not null && !email.Contains('@') ? $"E-mail invalide : « {email} »." : null,
                TropLong<Locataire>(nameof(Locataire.DesignationEntreprise), raison, "Raison sociale"),
                TropLong<Locataire>(nameof(Locataire.Nom), nom, "Nom"),
                TropLong<Locataire>(nameof(Locataire.Prenom), prenom, "Prénom"),
                TropLong<Locataire>(nameof(Locataire.ICE), ice, "ICE"),
                TropLong<Locataire>(nameof(Locataire.Rc), rc, "RC"),
                TropLong<Locataire>(nameof(Locataire.IdF), idf, "Identifiant fiscal"),
                TropLong<Locataire>(nameof(Locataire.NoCIN), cin, "CIN"),
                TropLong<Locataire>(nameof(Locataire.Telephone), tel, "Téléphone"),
                TropLong<Locataire>(nameof(Locataire.Email), email, "E-mail"),
                TropLong<Locataire>(nameof(Locataire.Adresse), adresse, "Adresse"),
                TropLong<Locataire>(nameof(Locataire.CodeLocataire), code, "Code locataire"));
            if (probleme is not null)
            {
                return probleme;
            }

            Ville? v = null;
            if (ville is not null && !villes.TryGetValue(Cle(ville), out v))
            {
                return $"Ville inconnue : « {ville} » (Configuration > Données de référence > Villes).";
            }

            bool morale = raison is not null;
            string cle = morale ? Cle(raison) : Cle($"{nom} {prenom}");
            if (!deja.Add(cle))
            {
                return "Locataire déjà existant (même raison sociale ou même nom) : ignoré.";
            }

            context.Locataires.Add(new Locataire
            {
                TypeLocataire = morale ? 1 : 0,
                DesignationEntreprise = raison,
                Nom = nom,
                Prenom = prenom,
                ICE = ice,
                Rc = rc,
                IdF = idf,
                NoCIN = cin,
                Telephone = tel,
                Email = email,
                Adresse = adresse,
                NoCity = v?.Numero,
                CodeLocataire = code,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, l => Net(l.RaisonSociale) ?? $"{l.Nom} {l.Prenom}".Trim());
    }

    // ---------------------------------------------------------------- Filiales
    public async Task<ImportResultResponse> ImportFilialesAsync(ImportRequest<FilialeImportRow> request)
    {
        HashSet<string> noms = (await context.Filiales.Select(f => f.Nom).ToListAsync()).Select(Cle).ToHashSet();
        Dictionary<string, Banque> banques = Index(await context.Banques.ToListAsync(), b => b.Designation);
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, f =>
        {
            string? nom = Net(f.Nom), reference = Net(f.NumeroReference), rib = Net(f.Rib), banque = Net(f.Banque), mode = Net(f.ModeReglement);

            string? probleme = PremierProbleme(
                nom is null ? "Nom manquant." : null,
                TropLong<Filiale>(nameof(Filiale.Nom), nom, "Nom"),
                TropLong<Filiale>(nameof(Filiale.NumeroReference), reference, "Numéro de référence"),
                TropLong<Filiale>(nameof(Filiale.Rib), rib, "RIB"),
                TropLong<Filiale>(nameof(Filiale.ModeReglement), mode, "Mode de règlement"));
            if (probleme is not null)
            {
                return probleme;
            }

            Banque? b = null;
            if (banque is not null && !banques.TryGetValue(Cle(banque), out b))
            {
                return $"Banque inconnue : « {banque} » (Configuration > Données de référence > Banques).";
            }

            if (!noms.Add(Cle(nom)))
            {
                return "Filiale déjà existante (même nom) : ignorée.";
            }

            context.Filiales.Add(new Filiale
            {
                Nom = nom!,
                NumeroReference = reference,
                Date = f.Date,
                Rib = rib,
                NoBanque = b?.Numero,
                ModeReglement = mode,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, f => f.Nom);
    }

    // ---------------------------------------------------------------- Typologies de charge
    public async Task<ImportResultResponse> ImportTypologiesChargeAsync(ImportRequest<TypologieChargeImportRow> request)
    {
        HashSet<string> deja = (await context.TypologiesCharge.Select(t => t.Typologie).ToListAsync()).Select(Cle).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, t =>
        {
            string? typologie = Net(t.Typologie), compte = Net(t.Compte), description = Net(t.Description);

            string? probleme = PremierProbleme(
                typologie is null ? "Typologie manquante." : null,
                TropLong<TypologieCharge>(nameof(TypologieCharge.Typologie), typologie, "Typologie"),
                TropLong<TypologieCharge>(nameof(TypologieCharge.Compte), compte, "Compte"),
                TropLong<TypologieCharge>(nameof(TypologieCharge.Description), description, "Description"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!deja.Add(Cle(typologie)))
            {
                return "Typologie déjà existante : ignorée.";
            }

            context.TypologiesCharge.Add(new TypologieCharge
            {
                Typologie = typologie!,
                Compte = compte,
                Description = description,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, t => t.Typologie);
    }

    // ---------------------------------------------------------------- Listes de référence génériques
    public Task<ImportResultResponse> ImportLookupAsync(string module, ImportRequest<LookupImportRow> request) => module switch
    {
        "villes" => ImportLookupAsync<Ville>(request),
        "typologies-lot" => ImportLookupAsync<LocalType>(request),
        "typologies-sinistre" => ImportLookupAsync<TypeSinistre>(request),
        "banques" => ImportLookupAsync<Banque>(request),
        "service-profils" => ImportLookupAsync<ServiceProfil>(request),
        "courtiers" => ImportLookupAsync<Courtier>(request),
        "assureurs" => ImportLookupAsync<Assureur>(request),
        "encaisseurs" => ImportLookupAsync<Encaisseur>(request),
        "societes-immobilieres" => ImportLookupAsync<SocieteImmobiliere>(request),
        "building-types" => ImportLookupAsync<BuildingType>(request),
        "proprietaires" => ImportLookupAsync<Proprietaire>(request),
        "pays" => ImportLookupAsync<Pays>(request),
        "periodicites" => ImportLookupAsync<Periodicite>(request),
        "types-taxe" => ImportLookupAsync<TypeTaxe>(request),
        _ => throw new ArgumentException($"Liste inconnue : {module}.")
    };

    private async Task<ImportResultResponse> ImportLookupAsync<T>(ImportRequest<LookupImportRow> request) where T : LookupEntity, new()
    {
        HashSet<string> deja = (await context.Set<T>().Select(e => e.Designation).ToListAsync()).Select(Cle).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, l =>
        {
            string? designation = Net(l.Designation);
            string? probleme = PremierProbleme(
                designation is null ? "Désignation manquante." : null,
                TropLong<T>(nameof(LookupEntity.Designation), designation, "Désignation"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!deja.Add(Cle(designation)))
            {
                return "Déjà existant (même désignation) : ignoré.";
            }

            var entity = new T
            {
                Designation = designation!,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            };
            if (entity is LookupWithFlagEntity flag)
            {
                flag.AccesComplet = l.AccesComplet ?? false;
            }

            context.Set<T>().Add(entity);
            return null;
        }, l => l.Designation);
    }
}

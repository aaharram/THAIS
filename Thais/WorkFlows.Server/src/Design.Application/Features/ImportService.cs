using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Interfaces;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Configuration;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.Patrimoine;
using Design.Domain.Entities.PropertyManagement;
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
                l.NbrePiece < 0 ? "Nbr place parking négatif." : null,
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

    // ---------------------------------------------------------------- Property Management : prestataires
    public async Task<ImportResultResponse> ImportPrestatairesAsync(ImportRequest<PrestataireImportRow> request)
    {
        HashSet<string> deja = (await context.Prestataires.Select(p => p.Designation).ToListAsync()).Select(Cle).ToHashSet();
        Dictionary<string, Ville> villes = Index(await context.Villes.ToListAsync(), v => v.Designation);
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, p =>
        {
            string? nom = Net(p.Designation), activite = Net(p.Activite), type = Net(p.TypePrestataire), enseigne = Net(p.Enseigne);
            string? rc = Net(p.Rc), idf = Net(p.Idf), ice = Net(p.Ice), adresse = Net(p.Adresse), cp = Net(p.CodePostal);
            string? ville = Net(p.Ville), pays = Net(p.Pays), notes = Net(p.Notes);

            string? probleme = PremierProbleme(
                nom is null ? "Désignation manquante." : null,
                TropLong<Prestataire>(nameof(Prestataire.Designation), nom, "Désignation"),
                TropLong<Prestataire>(nameof(Prestataire.Activite), activite, "Activité"),
                TropLong<Prestataire>(nameof(Prestataire.TypePrestataire), type, "Type de prestataire"),
                TropLong<Prestataire>(nameof(Prestataire.Enseigne), enseigne, "Enseigne"),
                TropLong<Prestataire>(nameof(Prestataire.Rc), rc, "RC"),
                TropLong<Prestataire>(nameof(Prestataire.Idf), idf, "Identifiant fiscal"),
                TropLong<Prestataire>(nameof(Prestataire.Ice), ice, "ICE"),
                TropLong<Prestataire>(nameof(Prestataire.Adresse), adresse, "Adresse"),
                TropLong<Prestataire>(nameof(Prestataire.PostalCode), cp, "Code postal"),
                TropLong<Prestataire>(nameof(Prestataire.Pays), pays, "Pays"),
                TropLong<Prestataire>(nameof(Prestataire.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            Ville? v = null;
            if (ville is not null && !villes.TryGetValue(Cle(ville), out v))
            {
                return $"Ville inconnue : « {ville} » (Configuration > Données de référence > Villes).";
            }

            if (!deja.Add(Cle(nom)))
            {
                return "Prestataire déjà existant (même désignation) : ignoré.";
            }

            context.Prestataires.Add(new Prestataire
            {
                Designation = nom!,
                Activite = activite ?? string.Empty,
                TypePrestataire = type ?? string.Empty,
                Enseigne = enseigne ?? string.Empty,
                Rc = rc ?? string.Empty,
                Idf = idf ?? string.Empty,
                Ice = ice ?? string.Empty,
                Adresse = adresse ?? string.Empty,
                PostalCode = cp ?? string.Empty,
                NoVille = v?.Numero,
                Pays = pays ?? string.Empty,
                Notes = notes ?? string.Empty,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, p => p.Designation);
    }

    // ---------------------------------------------------------------- Property Management : assurances
    public async Task<ImportResultResponse> ImportAssurancesAsync(ImportRequest<AssuranceImportRow> request)
    {
        Dictionary<string, Assureur> assureurs = Index(await context.Assureurs.ToListAsync(), a => a.Designation);
        Dictionary<string, Courtier> courtiers = Index(await context.Courtiers.ToListAsync(), c => c.Designation);
        HashSet<(int, string)> deja = (await context.Assurances.Select(a => new { a.NoAssureur, a.NumPolice }).ToListAsync())
            .Select(a => (a.NoAssureur, Cle(a.NumPolice))).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, a =>
        {
            string? police = Net(a.NumPolice), assureurNom = Net(a.Assureur), courtierNom = Net(a.Courtier);
            string? couverture = Net(a.TypeCouverture), notes = Net(a.Notes), statutBrut = Net(a.Statut);

            string statut = "EnCours";
            if (statutBrut is not null)
            {
                string s = Cle(statutBrut).Replace(" ", string.Empty).Replace("é", "e");
                if (s is "encours")
                {
                    statut = "EnCours";
                }
                else if (s is "termine")
                {
                    statut = "Terminé";
                }
                else
                {
                    return $"Statut inconnu : « {statutBrut} » (EnCours ou Terminé).";
                }
            }

            string? probleme = PremierProbleme(
                police is null ? "N° de police manquant." : null,
                assureurNom is null ? "Assureur manquant." : null,
                a.Montant < 0 ? "Montant négatif." : null,
                TropLong<Assurance>(nameof(Assurance.NumPolice), police, "N° de police"),
                TropLong<Assurance>(nameof(Assurance.TypeCouverture), couverture, "Type de couverture"),
                TropLong<Assurance>(nameof(Assurance.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!assureurs.TryGetValue(Cle(assureurNom), out Assureur? assureur))
            {
                return $"Assureur inconnu : « {assureurNom} » (Configuration > Données de référence > Assureurs).";
            }

            Courtier? courtier = null;
            if (courtierNom is not null && !courtiers.TryGetValue(Cle(courtierNom), out courtier))
            {
                return $"Courtier inconnu : « {courtierNom} » (Configuration > Données de référence > Courtiers).";
            }

            if (!deja.Add((assureur.Numero, Cle(police))))
            {
                return "Police déjà existante (même assureur et même numéro) : ignorée.";
            }

            context.Assurances.Add(new Assurance
            {
                NumPolice = police,
                NoAssureur = assureur.Numero,
                NoCourtier = courtier?.Numero,
                TypeCouverture = couverture,
                DateEffetContrat = a.DateEffetContrat,
                Montant = a.Montant,
                Statut = statut,
                Notes = notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, a => a.NumPolice ?? a.Assureur);
    }

    // ---------------------------------------------------------------- Property Management : charges
    public async Task<ImportResultResponse> ImportChargesAsync(ImportRequest<ChargeImportRow> request)
    {
        Dictionary<string, Building> actifs = Index(await context.Buildings.ToListAsync(), b => b.Designation);
        foreach (Building b in await context.Buildings.ToListAsync())
        {
            actifs.TryAdd(Cle(b.CodeImmeuble), b);
        }

        Dictionary<string, TypologieCharge> typologies = Index(await context.TypologiesCharge.ToListAsync(), t => t.Typologie);
        Dictionary<string, Prestataire> prestataires = Index(await context.Prestataires.ToListAsync(), p => p.Designation);
        HashSet<(int, int, int, int)> deja = (await context.Charges.Select(c => new { c.NoBuilding, c.NoTypologieCharge, c.Annee, c.NoPrestataire }).ToListAsync())
            .Select(c => (c.NoBuilding, c.NoTypologieCharge, c.Annee, c.NoPrestataire ?? 0)).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        ImportResultResponse resultat = await ExecuterAsync(request, c =>
        {
            string? nomActif = Net(c.Actif), typologieNom = Net(c.Typologie), prestataireNom = Net(c.Prestataire), notes = Net(c.Notes);

            string? probleme = PremierProbleme(
                nomActif is null ? "Actif manquant." : null,
                typologieNom is null ? "Typologie de charge manquante." : null,
                c.Annee is null ? "Année manquante." : null,
                c.Annee is < 1900 or > 2100 ? $"Année invalide : {c.Annee}." : null,
                c.Montant < 0 ? "Montant prévu négatif." : null,
                c.Realisation < 0 ? "Montant réalisé négatif." : null,
                TropLong<Charge>(nameof(Charge.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!actifs.TryGetValue(Cle(nomActif), out Building? actif))
            {
                return $"Actif introuvable : « {nomActif} » (créez-le ou importez-le d'abord).";
            }

            if (!typologies.TryGetValue(Cle(typologieNom), out TypologieCharge? typologie))
            {
                return $"Typologie de charge inconnue : « {typologieNom} » (Configuration > Typologies de charge).";
            }

            Prestataire? prestataire = null;
            if (prestataireNom is not null && !prestataires.TryGetValue(Cle(prestataireNom), out prestataire))
            {
                return $"Prestataire inconnu : « {prestataireNom} » (importez ou créez-le d'abord).";
            }

            if (!deja.Add((actif.Numero, typologie.Numero, c.Annee!.Value, prestataire?.Numero ?? 0)))
            {
                return "Charge déjà existante (même actif, typologie, année et prestataire) : ignorée.";
            }

            context.Charges.Add(new Charge
            {
                NoBuilding = actif.Numero,
                NoTypologieCharge = typologie.Numero,
                NoPrestataire = prestataire?.Numero,
                Annee = c.Annee.Value,
                Montant = c.Montant,
                Realisation = c.Realisation,
                DateDecaissement = c.DateDecaissement,
                Notes = notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, c => $"{c.Actif} / {c.Typologie} / {c.Annee}");

        // Comme à la saisie : le code « CH{numéro} » est posé une fois le numéro connu.
        List<Charge> sansCode = await context.Charges.Where(c => c.CodeCharge == null).ToListAsync();
        foreach (Charge charge in sansCode)
        {
            charge.CodeCharge = $"CH{charge.Numero}";
        }

        await context.SaveChangesAsync();
        return resultat;
    }

    // ---------------------------------------------------------------- Property Management : taxes
    public async Task<ImportResultResponse> ImportTaxesAsync(ImportRequest<TaxeImportRow> request)
    {
        Dictionary<string, Building> actifs = Index(await context.Buildings.ToListAsync(), b => b.Designation);
        foreach (Building b in await context.Buildings.ToListAsync())
        {
            actifs.TryAdd(Cle(b.CodeImmeuble), b);
        }

        Dictionary<string, TypeTaxe> types = Index(await context.TypesTaxe.ToListAsync(), t => t.Designation);
        Dictionary<(int, string), Local> locaux = [];
        foreach (Local l in await context.Locaux.ToListAsync())
        {
            locaux.TryAdd((l.NoBuilding, Cle(l.Designation)), l);
        }

        Dictionary<string, Locataire> locataires = [];
        foreach (Locataire l in await context.Locataires.ToListAsync())
        {
            string k = l.TypeLocataire == 1 ? Cle(l.DesignationEntreprise) : Cle($"{l.Nom} {l.Prenom}");
            if (k.Length > 0)
            {
                locataires.TryAdd(k, l);
            }
        }

        HashSet<(int, int, int, int, int)> deja = (await context.Taxes.Select(t => new { t.NoBuilding, t.NoLocal, t.NoLocataire, t.NoType, t.Annee }).ToListAsync())
            .Select(t => (t.NoBuilding, t.NoLocal ?? 0, t.NoLocataire ?? 0, t.NoType, t.Annee)).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, t =>
        {
            string? nomActif = Net(t.Actif), localNom = Net(t.Local), locataireNom = Net(t.Locataire), typeNom = Net(t.TypeTaxe);
            string? idFiscal = Net(t.IdFiscal), article = Net(t.NoArticle), notes = Net(t.Notes);

            string? probleme = PremierProbleme(
                nomActif is null ? "Actif manquant." : null,
                typeNom is null ? "Type de taxe manquant." : null,
                t.Annee is null ? "Année manquante." : null,
                t.Annee is < 1900 or > 2100 ? $"Année invalide : {t.Annee}." : null,
                t.MontantTaxe < 0 ? "Montant négatif." : null,
                TropLong<Taxe>(nameof(Taxe.IdFiscal), idFiscal, "Identifiant fiscal"),
                TropLong<Taxe>(nameof(Taxe.NoArticle), article, "N° d'article"),
                TropLong<Taxe>(nameof(Taxe.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!actifs.TryGetValue(Cle(nomActif), out Building? actif))
            {
                return $"Actif introuvable : « {nomActif} » (créez-le ou importez-le d'abord).";
            }

            if (!types.TryGetValue(Cle(typeNom), out TypeTaxe? type))
            {
                return $"Type de taxe inconnu : « {typeNom} » (Configuration > Données de référence > Types de taxe).";
            }

            Local? local = null;
            if (localNom is not null && !locaux.TryGetValue((actif.Numero, Cle(localNom)), out local))
            {
                return $"Local introuvable dans l'actif « {actif.Designation} » : « {localNom} ».";
            }

            Locataire? locataire = null;
            if (locataireNom is not null && !locataires.TryGetValue(Cle(locataireNom), out locataire))
            {
                return $"Locataire introuvable : « {locataireNom} » (importez-le d'abord).";
            }

            if (!deja.Add((actif.Numero, local?.Numero ?? 0, locataire?.Numero ?? 0, type.Numero, t.Annee!.Value)))
            {
                return "Taxe déjà existante (même actif, local, locataire, type et année) : ignorée.";
            }

            context.Taxes.Add(new Taxe
            {
                NoBuilding = actif.Numero,
                NoLocal = local?.Numero,
                NoLocataire = locataire?.Numero,
                NoType = type.Numero,
                IdFiscal = idFiscal,
                NoArticle = article,
                MontantTaxe = t.MontantTaxe,
                Annee = t.Annee.Value,
                Paye = t.Paye ?? false,
                Notes = notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, t => $"{t.Actif} / {t.TypeTaxe} / {t.Annee}");
    }

    // ---------------------------------------------------------------- Property Management : membres du syndic
    public async Task<ImportResultResponse> ImportMembresSyndicAsync(ImportRequest<SyndicImportRow> request)
    {
        HashSet<string> deja = (await context.Syndics.Select(s => new { s.Nom, s.Prenom }).ToListAsync())
            .Select(s => Cle($"{s.Nom} {s.Prenom}")).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        ImportResultResponse resultat = await ExecuterAsync(request, s =>
        {
            string? nom = Net(s.Nom), prenom = Net(s.Prenom), poste = Net(s.Poste), tel = Net(s.Telephone), notes = Net(s.Notes);

            string? probleme = PremierProbleme(
                nom is null ? "Nom manquant." : null,
                s.DebutMandat is not null && s.FinMandat is not null && s.FinMandat < s.DebutMandat ? "La fin du mandat précède son début." : null,
                TropLong<Syndic>(nameof(Syndic.Nom), nom, "Nom"),
                TropLong<Syndic>(nameof(Syndic.Prenom), prenom, "Prénom"),
                TropLong<Syndic>(nameof(Syndic.Poste), poste, "Poste"),
                TropLong<Syndic>(nameof(Syndic.Telephone), tel, "Téléphone"),
                TropLong<Syndic>(nameof(Syndic.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!deja.Add(Cle($"{nom} {prenom}")))
            {
                return "Membre déjà existant (même nom et même prénom) : ignoré.";
            }

            context.Syndics.Add(new Syndic
            {
                Nom = nom!,
                Prenom = prenom,
                Poste = poste,
                Telephone = tel,
                DebutMandat = s.DebutMandat,
                FinMandat = s.FinMandat,
                Notes = notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, s => $"{s.Nom} {s.Prenom}".Trim());

        // Comme à la saisie : l'identifiant « SYN{numéro} » est posé une fois le numéro connu.
        List<Syndic> sansId = await context.Syndics.Where(s => s.IdSyndic == null).ToListAsync();
        foreach (Syndic syndic in sansId)
        {
            syndic.IdSyndic = $"SYN{syndic.Numero}";
        }

        await context.SaveChangesAsync();
        return resultat;
    }

    // Valeur d'une liste fermée (statut, état, étape) : insensible à la casse, aux accents et aux espaces.
    private static string Simplifie(string s) =>
        new string(Cle(s).Normalize(System.Text.NormalizationForm.FormD)
            .Where(c => System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark && c != ' ')
            .ToArray());

    private static string? Choix(string? valeur, string[] autorises) =>
        valeur is null ? null : autorises.FirstOrDefault(a => Simplifie(a) == Simplifie(valeur));

    // ---------------------------------------------------------------- Typologies d'immobilisation
    public async Task<ImportResultResponse> ImportTypologiesImmobilisationAsync(ImportRequest<TypologieImmobilisationImportRow> request)
    {
        HashSet<string> deja = (await context.TypologiesImmobilisation.Select(t => t.ImmobilisationConcernee).ToListAsync()).Select(Cle).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, t =>
        {
            string? nom = Net(t.ImmobilisationConcernee), compte = Net(t.CompteComptable), amort = Net(t.CompteAmortissement), dotation = Net(t.CompteDotation);

            string? probleme = PremierProbleme(
                nom is null ? "Immobilisation concernée manquante." : null,
                t.Taux is < 0 or > 100 ? $"Taux invalide : {t.Taux} (entre 0 et 100)." : null,
                t.Duree is < 0 ? "Durée négative." : null,
                TropLong<TypologieImmobilisation>(nameof(TypologieImmobilisation.ImmobilisationConcernee), nom, "Immobilisation concernée"),
                TropLong<TypologieImmobilisation>(nameof(TypologieImmobilisation.CompteComptable), compte, "Compte comptable"),
                TropLong<TypologieImmobilisation>(nameof(TypologieImmobilisation.CompteAmortissement), amort, "Compte d'amortissement"),
                TropLong<TypologieImmobilisation>(nameof(TypologieImmobilisation.CompteDotation), dotation, "Compte de dotation"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!deja.Add(Cle(nom)))
            {
                return "Typologie déjà existante (même immobilisation) : ignorée.";
            }

            context.TypologiesImmobilisation.Add(new TypologieImmobilisation
            {
                ImmobilisationConcernee = nom!,
                CompteComptable = compte,
                CompteAmortissement = amort,
                CompteDotation = dotation,
                Taux = t.Taux,
                Duree = t.Duree,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, t => t.ImmobilisationConcernee);
    }

    // ---------------------------------------------------------------- Property Management : contrats prestataires
    public async Task<ImportResultResponse> ImportContratsPrestatairesAsync(ImportRequest<ContratPrestataireImportRow> request)
    {
        Dictionary<string, Prestataire> prestataires = Index(await context.Prestataires.ToListAsync(), p => p.Designation);
        HashSet<(int, string, DateTime?)> deja = (await context.PrestataireContrats.Select(c => new { c.NoPrestataire, c.Objet, c.DateDebut }).ToListAsync())
            .Select(c => (c.NoPrestataire, Cle(c.Objet), c.DateDebut?.Date)).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        ImportResultResponse resultat = await ExecuterAsync(request, c =>
        {
            string? prestataireNom = Net(c.Prestataire), objet = Net(c.Objet), notes = Net(c.Notes);

            string? probleme = PremierProbleme(
                prestataireNom is null ? "Prestataire manquant." : null,
                objet is null ? "Objet du contrat manquant." : null,
                c.Montant < 0 ? "Montant négatif." : null,
                TropLong<PrestataireContrat>(nameof(PrestataireContrat.Objet), objet, "Objet"),
                TropLong<PrestataireContrat>(nameof(PrestataireContrat.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!prestataires.TryGetValue(Cle(prestataireNom), out Prestataire? prestataire))
            {
                return $"Prestataire inconnu : « {prestataireNom} » (importez ou créez-le d'abord).";
            }

            if (!deja.Add((prestataire.Numero, Cle(objet), c.DateDebut?.Date)))
            {
                return "Contrat déjà existant (même prestataire, objet et date de début) : ignoré.";
            }

            context.PrestataireContrats.Add(new PrestataireContrat
            {
                NoPrestataire = prestataire.Numero,
                Objet = objet,
                DateContrat = c.DateContrat,
                DateDebut = c.DateDebut,
                DateFin = c.DateFin,
                Montant = c.Montant,
                Notes = notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, c => $"{c.Prestataire} / {c.Objet}");

        // Comme à la saisie : le numéro « CNTR{numéro} » est posé une fois le numéro connu.
        List<PrestataireContrat> sansNumero = await context.PrestataireContrats.Where(c => c.NumeroContrat == null).ToListAsync();
        foreach (PrestataireContrat contrat in sansNumero)
        {
            contrat.NumeroContrat = $"CNTR{contrat.Numero}";
        }

        await context.SaveChangesAsync();
        return resultat;
    }

    // ---------------------------------------------------------------- Property Management : bons de commande
    public async Task<ImportResultResponse> ImportBonsCommandeAsync(ImportRequest<BonCommandeImportRow> request)
    {
        string[] statuts = ["En attente", "Approuvé", "Rejeté"];
        Dictionary<string, Prestataire> prestataires = Index(await context.Prestataires.ToListAsync(), p => p.Designation);
        HashSet<string> deja = (await context.BonsDeCommande.Select(b => b.NumeroBonCommande).ToListAsync()).Select(Cle).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, b =>
        {
            string? numero = Net(b.NumeroBonCommande), prestataireNom = Net(b.Prestataire), compte = Net(b.Compte), compteCompta = Net(b.CompteComptable);
            string? statutBrut = Net(b.StatutApprobation), notes = Net(b.Notes);
            string? statut = statutBrut is null ? "En attente" : Choix(statutBrut, statuts);

            string? probleme = PremierProbleme(
                numero is null ? "N° de bon de commande manquant." : null,
                prestataireNom is null ? "Prestataire manquant." : null,
                b.DateCommande is null ? "Date de commande manquante." : null,
                statut is null ? $"Statut inconnu : « {statutBrut} » (En attente, Approuvé ou Rejeté)." : null,
                TropLong<BonDeCommande>(nameof(BonDeCommande.NumeroBonCommande), numero, "N° de bon de commande"),
                TropLong<BonDeCommande>(nameof(BonDeCommande.Compte), compte, "Compte"),
                TropLong<BonDeCommande>(nameof(BonDeCommande.CompteComptable), compteCompta, "Compte comptable"),
                TropLong<BonDeCommande>(nameof(BonDeCommande.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!prestataires.TryGetValue(Cle(prestataireNom), out Prestataire? prestataire))
            {
                return $"Prestataire inconnu : « {prestataireNom} » (importez ou créez-le d'abord).";
            }

            if (!deja.Add(Cle(numero)))
            {
                return "Bon de commande déjà existant (même numéro) : ignoré.";
            }

            context.BonsDeCommande.Add(new BonDeCommande
            {
                NumeroBonCommande = numero!,
                NoPrestataire = prestataire.Numero,
                DateCommande = b.DateCommande!.Value,
                DateReception = b.DateReception,
                Compte = compte,
                CompteComptable = compteCompta,
                StatutApprobation = statut!,
                Notes = notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, b => b.NumeroBonCommande);
    }

    // ---------------------------------------------------------------- Property Management : prestations d'achat
    public async Task<ImportResultResponse> ImportPrestationsAchatAsync(ImportRequest<PrestationAchatImportRow> request)
    {
        Dictionary<string, BonDeCommande> bons = Index(await context.BonsDeCommande.ToListAsync(), b => b.NumeroBonCommande);
        Dictionary<string, Building> actifs = Index(await context.Buildings.ToListAsync(), b => b.Designation);
        foreach (Building b in await context.Buildings.ToListAsync())
        {
            actifs.TryAdd(Cle(b.CodeImmeuble), b);
        }

        Dictionary<string, TypologieCharge> typologies = Index(await context.TypologiesCharge.ToListAsync(), t => t.Typologie);
        HashSet<(int, int, int, decimal, decimal)> deja = (await context.PrestationsAchat
                .Select(p => new { p.NoBonCommande, p.NoBuilding, p.NoTypologieCharge, p.PrixUnitaireHT, p.Quantite }).ToListAsync())
            .Select(p => (p.NoBonCommande, p.NoBuilding, p.NoTypologieCharge, p.PrixUnitaireHT, p.Quantite)).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, p =>
        {
            string? numeroBon = Net(p.NumeroBonCommande), nomActif = Net(p.Actif), typologieNom = Net(p.Typologie), notes = Net(p.Notes);
            decimal quantite = p.Quantite ?? 1;

            string? probleme = PremierProbleme(
                numeroBon is null ? "N° de bon de commande manquant." : null,
                nomActif is null ? "Actif manquant." : null,
                typologieNom is null ? "Typologie de charge manquante." : null,
                p.PrixUnitaireHt is null ? "Prix unitaire HT manquant." : null,
                p.PrixUnitaireHt < 0 ? "Prix unitaire négatif." : null,
                quantite <= 0 ? "Quantité nulle ou négative." : null,
                p.TauxTva is < 0 or > 100 ? $"Taux de TVA invalide : {p.TauxTva}." : null,
                p.TauxAmortissement is < 0 or > 100 ? $"Taux d'amortissement invalide : {p.TauxAmortissement}." : null,
                p.DureeAmortissementMois is < 0 ? "Durée d'amortissement négative." : null,
                TropLong<PrestationAchat>(nameof(PrestationAchat.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!bons.TryGetValue(Cle(numeroBon), out BonDeCommande? bon))
            {
                return $"Bon de commande introuvable : « {numeroBon} » (importez-le d'abord).";
            }

            if (!actifs.TryGetValue(Cle(nomActif), out Building? actif))
            {
                return $"Actif introuvable : « {nomActif} » (créez-le ou importez-le d'abord).";
            }

            if (!typologies.TryGetValue(Cle(typologieNom), out TypologieCharge? typologie))
            {
                return $"Typologie de charge inconnue : « {typologieNom} » (Configuration > Typologies de charge).";
            }

            if (!deja.Add((bon.Numero, actif.Numero, typologie.Numero, p.PrixUnitaireHt!.Value, quantite)))
            {
                return "Prestation déjà existante (même bon, actif, typologie, prix et quantité) : ignorée.";
            }

            context.PrestationsAchat.Add(new PrestationAchat
            {
                NoBonCommande = bon.Numero,
                NoBuilding = actif.Numero,
                NoTypologieCharge = typologie.Numero,
                PrixUnitaireHT = p.PrixUnitaireHt.Value,
                Quantite = quantite,
                TauxTVA = p.TauxTva,
                DureeAmortissementMois = p.DureeAmortissementMois,
                TauxAmortissement = p.TauxAmortissement,
                Notes = notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, p => $"{p.NumeroBonCommande} / {p.Actif} / {p.Typologie}");
    }

    // ---------------------------------------------------------------- Property Management : réclamations
    public async Task<ImportResultResponse> ImportReclamationsAsync(ImportRequest<ReclamationImportRow> request)
    {
        string[] etats = ["Ouverte", "En traitement", "Résolue", "Fermée"];
        Dictionary<string, Building> actifs = Index(await context.Buildings.ToListAsync(), b => b.Designation);
        foreach (Building b in await context.Buildings.ToListAsync())
        {
            actifs.TryAdd(Cle(b.CodeImmeuble), b);
        }

        Dictionary<(int, string), Local> locaux = [];
        foreach (Local l in await context.Locaux.ToListAsync())
        {
            locaux.TryAdd((l.NoBuilding, Cle(l.Designation)), l);
        }

        Dictionary<string, Locataire> locataires = IndexLocataires(await context.Locataires.ToListAsync());
        HashSet<(int, int, int, DateTime?, string)> deja = (await context.Reclamations
                .Select(r => new { r.NoBuilding, r.NoLocal, r.NoLocataire, r.DateReclamation, r.Objet }).ToListAsync())
            .Select(r => (r.NoBuilding, r.NoLocal ?? 0, r.NoLocataire, r.DateReclamation?.Date, Cle(r.Objet))).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        return await ExecuterAsync(request, r =>
        {
            string? nomActif = Net(r.Actif), localNom = Net(r.Local), locataireNom = Net(r.Locataire), etatBrut = Net(r.Etat), objet = Net(r.Objet), notes = Net(r.Notes);
            string? etat = etatBrut is null ? "Ouverte" : Choix(etatBrut, etats);

            string? probleme = PremierProbleme(
                nomActif is null ? "Actif manquant." : null,
                locataireNom is null ? "Locataire manquant." : null,
                etat is null ? $"État inconnu : « {etatBrut} » (Ouverte, En traitement, Résolue ou Fermée)." : null,
                TropLong<Reclamation>(nameof(Reclamation.Objet), objet, "Objet"),
                TropLong<Reclamation>(nameof(Reclamation.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!actifs.TryGetValue(Cle(nomActif), out Building? actif))
            {
                return $"Actif introuvable : « {nomActif} » (créez-le ou importez-le d'abord).";
            }

            Local? local = null;
            if (localNom is not null && !locaux.TryGetValue((actif.Numero, Cle(localNom)), out local))
            {
                return $"Local introuvable dans l'actif « {actif.Designation} » : « {localNom} ».";
            }

            if (!locataires.TryGetValue(Cle(locataireNom), out Locataire? locataire))
            {
                return $"Locataire introuvable : « {locataireNom} » (importez-le d'abord).";
            }

            if (!deja.Add((actif.Numero, local?.Numero ?? 0, locataire.Numero, r.DateReclamation?.Date, Cle(objet))))
            {
                return "Réclamation déjà existante (même actif, local, locataire, date et objet) : ignorée.";
            }

            context.Reclamations.Add(new Reclamation
            {
                NoBuilding = actif.Numero,
                NoLocal = local?.Numero,
                NoLocataire = locataire.Numero,
                Etat = etat!,
                DateReclamation = r.DateReclamation,
                Objet = objet,
                Notes = notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, r => $"{r.Actif} / {r.Locataire}");
    }

    // ---------------------------------------------------------------- Property Management : sinistres
    public async Task<ImportResultResponse> ImportSinistresAsync(ImportRequest<SinistreImportRow> request)
    {
        string[] etapes = ["Déclaré", "Expertise", "Réclamation", "Remboursement", "Clôturé"];
        Dictionary<string, Building> actifs = Index(await context.Buildings.ToListAsync(), b => b.Designation);
        foreach (Building b in await context.Buildings.ToListAsync())
        {
            actifs.TryAdd(Cle(b.CodeImmeuble), b);
        }

        Dictionary<(int, string), Local> locaux = [];
        foreach (Local l in await context.Locaux.ToListAsync())
        {
            locaux.TryAdd((l.NoBuilding, Cle(l.Designation)), l);
        }

        Dictionary<string, Assurance> assurances = Index(await context.Assurances.ToListAsync(), a => a.NumPolice);
        Dictionary<string, TypeSinistre> types = Index(await context.TypeSinistres.ToListAsync(), t => t.Designation);
        HashSet<string> deja = (await context.Sinistres.Select(s => new { s.NoSinistre, s.NoBuilding, s.NoLocal, s.NoTypeSinistre, s.DateDeclaration }).ToListAsync())
            .Select(s => CleSinistre(s.NoSinistre, s.NoBuilding, s.NoLocal ?? 0, s.NoTypeSinistre, s.DateDeclaration)).ToHashSet();
        int user = request.AddUser ?? 0;
        DateTime now = DateTime.UtcNow;

        ImportResultResponse resultat = await ExecuterAsync(request, s =>
        {
            string? nomActif = Net(s.Actif), localNom = Net(s.Local), police = Net(s.NumPolice), typeNom = Net(s.TypeSinistre), etapeBrut = Net(s.EtapeSuivi);
            string? expert = Net(s.NomExpert), refDossier = Net(s.RefDossierAssurance), noSinistre = Net(s.NoSinistre), notes = Net(s.Notes);
            string? etape = etapeBrut is null ? "Déclaré" : Choix(etapeBrut, etapes);

            string? probleme = PremierProbleme(
                nomActif is null ? "Actif manquant." : null,
                typeNom is null ? "Type de sinistre manquant." : null,
                etape is null ? $"Étape inconnue : « {etapeBrut} » (Déclaré, Expertise, Réclamation, Remboursement ou Clôturé)." : null,
                s.EstimationDegatBailleur < 0 || s.EstimationDegatLocataire < 0 || s.MontantFacture < 0 || s.MontantRemuneration < 0 ? "Montant négatif." : null,
                TropLong<Sinistre>(nameof(Sinistre.NomExpert), expert, "Nom de l'expert"),
                TropLong<Sinistre>(nameof(Sinistre.RefDossierAssurance), refDossier, "Réf. dossier assurance"),
                TropLong<Sinistre>(nameof(Sinistre.NoSinistre), noSinistre, "N° de sinistre"),
                TropLong<Sinistre>(nameof(Sinistre.Notes), notes, "Notes"));
            if (probleme is not null)
            {
                return probleme;
            }

            if (!actifs.TryGetValue(Cle(nomActif), out Building? actif))
            {
                return $"Actif introuvable : « {nomActif} » (créez-le ou importez-le d'abord).";
            }

            if (!types.TryGetValue(Cle(typeNom), out TypeSinistre? type))
            {
                return $"Type de sinistre inconnu : « {typeNom} » (Configuration > Données de référence > Typologies de sinistre).";
            }

            Local? local = null;
            if (localNom is not null && !locaux.TryGetValue((actif.Numero, Cle(localNom)), out local))
            {
                return $"Local introuvable dans l'actif « {actif.Designation} » : « {localNom} ».";
            }

            Assurance? assurance = null;
            if (police is not null && !assurances.TryGetValue(Cle(police), out assurance))
            {
                return $"Assurance introuvable (n° de police) : « {police} » (importez-la d'abord).";
            }

            if (!deja.Add(CleSinistre(noSinistre, actif.Numero, local?.Numero ?? 0, type.Numero, s.DateDeclaration)))
            {
                return "Sinistre déjà existant (même n° de sinistre, ou mêmes actif, local, type et date de déclaration) : ignoré.";
            }

            context.Sinistres.Add(new Sinistre
            {
                NoBuilding = actif.Numero,
                NoLocal = local?.Numero,
                NoAssurance = assurance?.Numero,
                NoTypeSinistre = type.Numero,
                EtapeSuivi = etape!,
                DateDeclaration = s.DateDeclaration,
                DateExpertise = s.DateExpertise,
                DateReclamation = s.DateReclamation,
                DateRemboursement = s.DateRemboursement,
                EstimationDegatBailleur = s.EstimationDegatBailleur,
                EstimationDegatLocataire = s.EstimationDegatLocataire,
                MontantFacture = s.MontantFacture,
                MontantRemuneration = s.MontantRemuneration,
                NomExpert = expert,
                RefDossierAssurance = refDossier,
                NoSinistre = noSinistre,
                Notes = notes,
                AddUser = user,
                AddDate = now,
                ModUser = user,
                ModDate = now
            });
            return null;
        }, s => noSinistreOuActif(s));

        // Comme à la saisie : l'identifiant « SIN{numéro} » est posé une fois le numéro connu.
        List<Sinistre> sansId = await context.Sinistres.Where(s => s.IdSinistre == null).ToListAsync();
        foreach (Sinistre sinistre in sansId)
        {
            sinistre.IdSinistre = $"SIN{sinistre.Numero}";
        }

        await context.SaveChangesAsync();
        return resultat;

        static string noSinistreOuActif(SinistreImportRow s) => Net(s.NoSinistre) ?? $"{s.Actif} / {s.TypeSinistre}";
    }

    private static string CleSinistre(string? noSinistre, int actif, int local, int type, DateTime? date) =>
        Net(noSinistre) is { } n ? $"n:{Cle(n)}" : $"a:{actif}|{local}|{type}|{date?.Date:yyyyMMdd}";

    private static Dictionary<string, Locataire> IndexLocataires(IEnumerable<Locataire> locataires)
    {
        Dictionary<string, Locataire> d = [];
        foreach (Locataire l in locataires)
        {
            string k = l.TypeLocataire == 1 ? Cle(l.DesignationEntreprise) : Cle($"{l.Nom} {l.Prenom}");
            if (k.Length > 0)
            {
                d.TryAdd(k, l);
            }
        }

        return d;
    }
}

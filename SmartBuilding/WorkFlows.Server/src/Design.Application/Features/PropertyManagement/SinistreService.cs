using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.PropertyManagement;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Leasing;
using Design.Domain.Entities.PropertyManagement;
using Design.Infrastructure.Data;

namespace Design.Application.Features.PropertyManagement;

public class SinistreService(DbDesignContext context, ILogger<SinistreService> logger) : ISinistreService
{
    private static string NomAffiche(Locataire loc) =>
        loc.TypeLocataire == 1 ? (loc.DesignationEntreprise ?? string.Empty) : $"{loc.Nom} {loc.Prenom}".Trim();

    // RMANew (ListSinistre.vb) : le "Locataire" affiché sur la liste des sinistres n'est pas
    // une FK directe sur Sinistre - c'est l'occupant courant du Local (via son bail actif),
    // résolu par une seule requête batchée pour tous les locaux de la page plutôt qu'une
    // requête par ligne (même correctif N+1 que RMANew avait déjà appliqué ici).
    private async Task<Dictionary<int, string>> GetLocataireParLocalAsync(IEnumerable<int> localIds)
    {
        List<int> ids = localIds.Distinct().ToList();
        if (ids.Count == 0)
        {
            return new Dictionary<int, string>();
        }

        List<Bail> bauxActifs = await context.Baux
            .Where(b => ids.Contains(b.NoLocal) && b.Etat == "En cours de location")
            .ToListAsync();

        List<int> locataireIds = bauxActifs.Select(b => b.NoLocataire).Distinct().ToList();
        Dictionary<int, Locataire> locataires = await context.Locataires
            .Where(x => locataireIds.Contains(x.Numero))
            .ToDictionaryAsync(x => x.Numero);

        var result = new Dictionary<int, string>();
        foreach (Bail bail in bauxActifs)
        {
            if (locataires.TryGetValue(bail.NoLocataire, out Locataire? loc))
            {
                result[bail.NoLocal] = NomAffiche(loc);
            }
        }

        return result;
    }

    private async Task<SinistreResponse> ToResponseAsync(Sinistre entity)
    {
        string? nomBuilding = await context.Buildings
            .Where(x => x.Numero == entity.NoBuilding).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomLocal = entity.NoLocal is null
            ? null
            : await context.Locaux.Where(x => x.Numero == entity.NoLocal).Select(x => x.Designation).FirstOrDefaultAsync();
        string? nomType = await context.TypeSinistres
            .Where(x => x.Numero == entity.NoTypeSinistre).Select(x => x.Designation).FirstOrDefaultAsync();

        string? numPolice = null, nomAssureur = null, nomCourtier = null;
        if (entity.NoAssurance is not null)
        {
            Assurance? assurance = await context.Assurances.FindAsync(entity.NoAssurance.Value);
            if (assurance is not null)
            {
                numPolice = assurance.NumPolice;
                nomAssureur = await context.Assureurs.Where(x => x.Numero == assurance.NoAssureur).Select(x => x.Designation).FirstOrDefaultAsync();
                nomCourtier = assurance.NoCourtier is null
                    ? null
                    : await context.Courtiers.Where(x => x.Numero == assurance.NoCourtier).Select(x => x.Designation).FirstOrDefaultAsync();
            }
        }

        string? nomLocataire = null;
        if (entity.NoLocal is not null)
        {
            Dictionary<int, string> parLocal = await GetLocataireParLocalAsync(new[] { entity.NoLocal.Value });
            parLocal.TryGetValue(entity.NoLocal.Value, out nomLocataire);
        }

        return ToResponse(entity, nomBuilding, nomLocal, nomType, numPolice, nomAssureur, nomCourtier, nomLocataire);
    }

    private static SinistreResponse ToResponse(
        Sinistre entity, string? nomBuilding, string? nomLocal, string? nomType,
        string? numPolice, string? nomAssureur, string? nomCourtier, string? nomLocataire) => new()
    {
        Numero = entity.Numero,
        NoBuilding = entity.NoBuilding,
        NomBuilding = nomBuilding,
        NoLocal = entity.NoLocal,
        NomLocal = nomLocal,
        NoAssurance = entity.NoAssurance,
        NumPoliceAssurance = numPolice,
        NomAssureur = nomAssureur,
        NomCourtier = nomCourtier,
        NomLocataire = nomLocataire,
        NoTypeSinistre = entity.NoTypeSinistre,
        NomTypeSinistre = nomType,
        EtapeSuivi = entity.EtapeSuivi,
        DateDeclaration = entity.DateDeclaration,
        DateExpertise = entity.DateExpertise,
        DateReclamation = entity.DateReclamation,
        DateRemboursement = entity.DateRemboursement,
        EstimationDegatBailleur = entity.EstimationDegatBailleur,
        EstimationDegatLocataire = entity.EstimationDegatLocataire,
        MontantFacture = entity.MontantFacture,
        MontantRemuneration = entity.MontantRemuneration,
        Cumul = entity.Cumul,
        NomExpert = entity.NomExpert,
        RefDossierAssurance = entity.RefDossierAssurance,
        IdSinistre = entity.IdSinistre,
        Notes = entity.Notes,
        NoSinistre = entity.NoSinistre,
        AgentAyantReclame = entity.AgentAyantReclame,
        CompteurFicheIntervention = entity.CompteurFicheIntervention,
        ReferenceDossierDAG = entity.ReferenceDossierDAG,
        MontantExpert = entity.MontantExpert,
        ReferenceFacture = entity.ReferenceFacture,
        ObjetReclamation = entity.ObjetReclamation,
        Site = entity.Site,
        CheminExpertiseLocataire = entity.CheminExpertiseLocataire,
        CheminExpertiseBailleur = entity.CheminExpertiseBailleur,
        CheminPVExpertise = entity.CheminPVExpertise,
        AddUser = entity.AddUser,
        AddDate = entity.AddDate,
        ModUser = entity.ModUser,
        ModDate = entity.ModDate
    };

    private async Task<List<SinistreResponse>> ToResponseListAsync(List<Sinistre> items)
    {
        List<int> buildingIds = items.Select(x => x.NoBuilding).Distinct().ToList();
        List<int> localIds = items.Where(x => x.NoLocal != null).Select(x => x.NoLocal!.Value).Distinct().ToList();
        List<int> typeIds = items.Select(x => x.NoTypeSinistre).Distinct().ToList();
        List<int> assuranceIds = items.Where(x => x.NoAssurance != null).Select(x => x.NoAssurance!.Value).Distinct().ToList();

        Dictionary<int, string> buildings = await context.Buildings.Where(x => buildingIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> locaux = await context.Locaux.Where(x => localIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> types = await context.TypeSinistres.Where(x => typeIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);

        List<Assurance> assurances = await context.Assurances.Where(x => assuranceIds.Contains(x.Numero)).ToListAsync();
        Dictionary<int, Assurance> assuranceById = assurances.ToDictionary(x => x.Numero);
        List<int> assureurIds = assurances.Select(a => a.NoAssureur).Distinct().ToList();
        List<int> courtierIds = assurances.Where(a => a.NoCourtier != null).Select(a => a.NoCourtier!.Value).Distinct().ToList();
        Dictionary<int, string> assureurs = await context.Assureurs.Where(x => assureurIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);
        Dictionary<int, string> courtiers = await context.Courtiers.Where(x => courtierIds.Contains(x.Numero)).ToDictionaryAsync(x => x.Numero, x => x.Designation);

        Dictionary<int, string> locataireParLocal = await GetLocataireParLocalAsync(localIds);

        return items.Select(item =>
        {
            Assurance? assurance = item.NoAssurance != null && assuranceById.TryGetValue(item.NoAssurance.Value, out Assurance? a) ? a : null;
            string? nomAssureur = assurance != null && assureurs.TryGetValue(assurance.NoAssureur, out string? au) ? au : null;
            string? nomCourtier = assurance?.NoCourtier != null && courtiers.TryGetValue(assurance.NoCourtier.Value, out string? co) ? co : null;
            string? nomLocataire = item.NoLocal != null && locataireParLocal.TryGetValue(item.NoLocal.Value, out string? loc) ? loc : null;

            return ToResponse(
                item,
                buildings.TryGetValue(item.NoBuilding, out string? building) ? building : null,
                item.NoLocal != null && locaux.TryGetValue(item.NoLocal.Value, out string? local) ? local : null,
                types.TryGetValue(item.NoTypeSinistre, out string? type) ? type : null,
                assurance?.NumPolice,
                nomAssureur,
                nomCourtier,
                nomLocataire
            );
        }).ToList();
    }

    public async Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request)
    {
        try
        {
            if (request.PageNumber < 1) request.PageNumber = 1;
            if (request.PageSize is < 1 or > 100) request.PageSize = 10;

            IQueryable<Sinistre> query = context.Sinistres;

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.DateDeclaration);

            List<Sinistre> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var buildingIds = allMatching.Select(s => s.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(s => buildingNames.TryGetValue(s.NoBuilding, out string? name) && name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;
            List<Sinistre> items = allMatching.Skip((request.PageNumber - 1) * request.PageSize).Take(request.PageSize).ToList();

            List<SinistreResponse> mapped = await ToResponseListAsync(items);

            return new PagedResult<object>
            {
                Items = mapped.Cast<object>().ToList(),
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize
            };
        }
        catch (Exception ex)
        {
            logger.LogError("Error fetching Sinistres: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<SinistreResponse> GetByIdAsync(int id)
    {
        Sinistre? entity = await context.Sinistres.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Sinistre not found");
        return await ToResponseAsync(entity);
    }

    public async Task<SinistreResponse> CreateAsync(SinistreRequest request)
    {
        var entity = new Sinistre
        {
            NoBuilding = request.NoBuilding,
            NoLocal = request.NoLocal,
            NoAssurance = request.NoAssurance,
            NoTypeSinistre = request.NoTypeSinistre,
            EtapeSuivi = string.IsNullOrWhiteSpace(request.EtapeSuivi) ? "Déclaré" : request.EtapeSuivi,
            DateDeclaration = request.DateDeclaration,
            DateExpertise = request.DateExpertise,
            DateReclamation = request.DateReclamation,
            DateRemboursement = request.DateRemboursement,
            EstimationDegatBailleur = request.EstimationDegatBailleur,
            EstimationDegatLocataire = request.EstimationDegatLocataire,
            MontantFacture = request.MontantFacture,
            MontantRemuneration = request.MontantRemuneration,
            Cumul = request.Cumul,
            NomExpert = request.NomExpert,
            RefDossierAssurance = request.RefDossierAssurance,
            Notes = request.Notes,
            NoSinistre = request.NoSinistre,
            AgentAyantReclame = request.AgentAyantReclame,
            CompteurFicheIntervention = request.CompteurFicheIntervention,
            ReferenceDossierDAG = request.ReferenceDossierDAG,
            MontantExpert = request.MontantExpert,
            ReferenceFacture = request.ReferenceFacture,
            ObjetReclamation = request.ObjetReclamation,
            Site = request.Site,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        context.Sinistres.Add(entity);
        await context.SaveChangesAsync();

        entity.IdSinistre = $"SIN{entity.Numero}";
        await context.SaveChangesAsync();

        logger.LogInformation("Sinistre with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    public async Task<SinistreResponse> UpdateAsync(int id, SinistreRequest request)
    {
        Sinistre? entity = await context.Sinistres.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Sinistre not found");

        entity.NoBuilding = request.NoBuilding;
        entity.NoLocal = request.NoLocal;
        entity.NoAssurance = request.NoAssurance;
        entity.NoTypeSinistre = request.NoTypeSinistre;
        entity.EtapeSuivi = string.IsNullOrWhiteSpace(request.EtapeSuivi) ? entity.EtapeSuivi : request.EtapeSuivi;
        entity.DateDeclaration = request.DateDeclaration;
        entity.DateExpertise = request.DateExpertise;
        entity.DateReclamation = request.DateReclamation;
        entity.DateRemboursement = request.DateRemboursement;
        entity.EstimationDegatBailleur = request.EstimationDegatBailleur;
        entity.EstimationDegatLocataire = request.EstimationDegatLocataire;
        entity.MontantFacture = request.MontantFacture;
        entity.MontantRemuneration = request.MontantRemuneration;
        entity.Cumul = request.Cumul;
        entity.NomExpert = request.NomExpert;
        entity.RefDossierAssurance = request.RefDossierAssurance;
        entity.Notes = request.Notes;
        entity.NoSinistre = request.NoSinistre;
        entity.AgentAyantReclame = request.AgentAyantReclame;
        entity.CompteurFicheIntervention = request.CompteurFicheIntervention;
        entity.ReferenceDossierDAG = request.ReferenceDossierDAG;
        entity.MontantExpert = request.MontantExpert;
        entity.ReferenceFacture = request.ReferenceFacture;
        entity.ObjetReclamation = request.ObjetReclamation;
        entity.Site = request.Site;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await context.SaveChangesAsync();

        logger.LogInformation("Sinistre with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        Sinistre? entity = await context.Sinistres.FindAsync(id);
        if (entity == null) return 0;

        context.Sinistres.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("Sinistre with ID {Id} deleted successfully.", id);

        return result;
    }

    // Pièces jointes (CR Expert Locataire/Bailleur, PV d'expertise) : même principe que
    // ProfileController pour la photo de profil - le fichier physique est géré par le
    // controller, ici on ne stocke/retourne que le nom de fichier.
    public async Task<SinistreResponse> UpdateAttachmentAsync(int id, string kind, string fileName)
    {
        Sinistre? entity = await context.Sinistres.FindAsync(id);
        if (entity == null) throw new KeyNotFoundException("Sinistre not found");

        switch (kind)
        {
            case "expertise-locataire": entity.CheminExpertiseLocataire = fileName; break;
            case "expertise-bailleur": entity.CheminExpertiseBailleur = fileName; break;
            case "pv-expertise": entity.CheminPVExpertise = fileName; break;
            default: throw new ArgumentException("Type de pièce jointe invalide.", nameof(kind));
        }
        entity.ModDate = DateTime.UtcNow;
        await context.SaveChangesAsync();

        logger.LogInformation("Sinistre {Id} attachment '{Kind}' updated.", id, kind);

        return await ToResponseAsync(entity);
    }

    public async Task<string?> GetAttachmentFileNameAsync(int id, string kind)
    {
        Sinistre? entity = await context.Sinistres.FindAsync(id);
        if (entity == null) return null;

        return kind switch
        {
            "expertise-locataire" => entity.CheminExpertiseLocataire,
            "expertise-bailleur" => entity.CheminExpertiseBailleur,
            "pv-expertise" => entity.CheminPVExpertise,
            _ => null
        };
    }
}

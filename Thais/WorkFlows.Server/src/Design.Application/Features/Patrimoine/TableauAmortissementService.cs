using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Design.Application.Common;
using Design.Application.Interfaces.Patrimoine;
using Design.Contract.Common;
using Design.Contract.Requests;
using Design.Contract.Responses;
using Design.Domain.Entities.Configuration;
using Design.Domain.Entities.Patrimoine;
using Design.Infrastructure.Data;

namespace Design.Application.Features.Patrimoine;

public class TableauAmortissementService(DbDesignContext context, ILogger<TableauAmortissementService> logger)
    : ITableauAmortissementService
{
    private async Task<TableauAmortissementResponse> ToResponseAsync(TableauAmortissement entity)
    {
        Building? building = await context.Buildings.FindAsync(entity.NoBuilding);
        TypologieImmobilisation? typologie = await context.TypologiesImmobilisation.FindAsync(entity.ImmobConcernees);

        List<TableauAmortissementVersionResponse> versions = await context.TableauxAmortissementVersions
            .Where(v => v.NoTableauAmortissement == entity.Numero)
            .OrderByDescending(v => v.DateAmortissement)
            .Select(v => new TableauAmortissementVersionResponse
            {
                Numero = v.Numero,
                AmortissementsAnterieurs = v.AmortissementsAnterieurs,
                AmortissementsNormaux = v.AmortissementsNormaux,
                DateAmortissement = v.DateAmortissement
            })
            .ToListAsync();

        return new TableauAmortissementResponse
        {
            Numero = entity.Numero,
            NoBuilding = entity.NoBuilding,
            NomBuilding = building?.Designation,
            TitreFoncier = building?.TitreFoncier,
            CompteComptable = typologie?.CompteComptable,
            CompteGeneral = building?.CompteGeneral,
            NAffectation = building?.NAffectation,
            ImmobConcernees = entity.ImmobConcernees,
            NomImmobConcernees = typologie?.ImmobilisationConcernee,
            DateEntree = entity.DateEntree,
            VaPrixAcquisition = entity.VaPrixAcquisition,
            ValeurTerrain = entity.ValeurTerrain,
            ValeurConstruction = entity.ValeurConstruction,
            ValeurAmenagement = entity.ValeurAmenagement,
            AmortiAnterieurs = entity.AmortiAnterieurs,
            AmortiDbeneficebTaux = entity.AmortiDbeneficebTaux,
            AmortiDbenficebDuree = entity.AmortiDbenficebDuree,
            AmortiDbeneficebNorm = entity.AmortiDbeneficebNorm,
            TotalAmortiAlaFin = entity.TotalAmortiAlaFin,
            DateProchaineAmorti = entity.DateProchaineAmorti,
            ImmobPrincipal = entity.ImmobPrincipal,
            Inactif = entity.Inactif,
            Versions = versions,
            AddUser = entity.AddUser,
            AddDate = entity.AddDate,
            ModUser = entity.ModUser,
            ModDate = entity.ModDate
        };
    }

    // Amortissement linéaire, même formule que RMANew (DataEntryAmortissemnt.Validate).
    // RMANew dérive la "date de prochaine génération" d'un lot mensuel externe
    // (OrdreGenerationAmortissement) qui n'existe pas dans Smart-Building ; on la
    // remplace par le 1er jour du mois courant, ce qui reproduit le même calcul
    // pour le cas normal (saisie du jour).
    private async Task ApplyAmortissementCalculationAsync(TableauAmortissement entity, TableauAmortissementRequest request)
    {
        TypologieImmobilisation? typologie = await context.TypologiesImmobilisation.FindAsync(request.ImmobConcernees);
        decimal taux = typologie?.Taux ?? 0;
        int duree = typologie?.Duree ?? 0;

        decimal amortiNorm;
        if (taux > 0 && duree > 0)
        {
            amortiNorm = request.VaPrixAcquisition / (duree * 12);
        }
        else if (taux > 0 && duree == 0)
        {
            amortiNorm = request.VaPrixAcquisition * (taux / 100) / 12;
        }
        else if (duree > 0 && taux == 0)
        {
            amortiNorm = request.VaPrixAcquisition / (duree * 12);
        }
        else
        {
            amortiNorm = 0;
        }

        amortiNorm = Math.Round(amortiNorm, 2);

        DateTime dateEntree = (request.DateEntree ?? DateTime.UtcNow).Date;
        DateTime dateProchaineAmortRef = new(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);

        decimal montantAnterieur;
        decimal montantTotal;
        DateTime dateProchaineAmorti;

        if (dateEntree >= dateProchaineAmortRef)
        {
            montantAnterieur = 0;
            montantTotal = amortiNorm;
            dateProchaineAmorti = dateEntree.AddMonths(1);
        }
        else
        {
            int nbMois = ((dateProchaineAmortRef.Year - dateEntree.Year) * 12) + dateProchaineAmortRef.Month - dateEntree.Month;
            if (nbMois <= 0)
            {
                nbMois = 1;
            }

            montantAnterieur = Math.Max(Math.Round((nbMois - 1) * amortiNorm, 2), 0);
            montantTotal = Math.Round(nbMois * amortiNorm, 2);
            dateProchaineAmorti = dateProchaineAmortRef;
        }

        entity.AmortiDbeneficebTaux = taux;
        entity.AmortiDbenficebDuree = duree;
        entity.AmortiDbeneficebNorm = amortiNorm;
        entity.AmortiAnterieurs = montantAnterieur;
        entity.TotalAmortiAlaFin = montantTotal;
        entity.DateProchaineAmorti = dateProchaineAmorti;
    }

    public async Task<PagedResult<object>> GetAllAsync(GetFilterSearchSortRequest request)
    {
        try
        {
            if (request.PageNumber < 1)
            {
                request.PageNumber = 1;
            }

            if (request.PageSize is < 1 or > 100)
            {
                request.PageSize = 10;
            }

            IQueryable<TableauAmortissement> query = context.TableauxAmortissement.Where(t => !t.Inactif);

            if (request.Filters != null && request.Filters.Any())
            {
                query = query.ApplyFilters(request.Filters);
            }

            query = !string.IsNullOrWhiteSpace(request.SortField)
                ? query.ApplySorting(request.SortField, request.SortOrder)
                : query.OrderByDescending(e => e.Numero);

            List<TableauAmortissement> allMatching = await query.ToListAsync();

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string search = request.Search.Trim().ToLower();
                var buildingIds = allMatching.Select(t => t.NoBuilding).Distinct().ToList();
                Dictionary<int, string> buildingNames = await context.Buildings
                    .Where(b => buildingIds.Contains(b.Numero))
                    .ToDictionaryAsync(b => b.Numero, b => b.Designation);

                allMatching = allMatching
                    .Where(t => buildingNames.TryGetValue(t.NoBuilding, out string? name) && name.ToLower().Contains(search))
                    .ToList();
            }

            int totalCount = allMatching.Count;

            List<TableauAmortissement> items = allMatching
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();

            var mapped = new List<TableauAmortissementResponse>();
            foreach (TableauAmortissement item in items)
            {
                mapped.Add(await ToResponseAsync(item));
            }

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
            logger.LogError("Error fetching TableauxAmortissement: {ExMessage}", ex.Message);
            throw;
        }
    }

    public async Task<TableauAmortissementResponse> GetByIdAsync(int id)
    {
        TableauAmortissement? entity = await context.TableauxAmortissement.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("TableauAmortissement not found");
        }

        return await ToResponseAsync(entity);
    }

    public async Task<TableauAmortissementResponse> CreateAsync(TableauAmortissementRequest request)
    {
        var entity = new TableauAmortissement
        {
            NoBuilding = request.NoBuilding,
            ImmobConcernees = request.ImmobConcernees,
            DateEntree = request.DateEntree,
            VaPrixAcquisition = request.VaPrixAcquisition,
            ValeurTerrain = request.ValeurTerrain,
            ValeurConstruction = request.ValeurConstruction,
            ValeurAmenagement = request.ValeurAmenagement,
            ImmobPrincipal = request.ImmobPrincipal,
            Inactif = request.Inactif,
            AddUser = request.AddUser ?? 0,
            AddDate = DateTime.UtcNow,
            ModUser = request.ModUser ?? request.AddUser ?? 0,
            ModDate = DateTime.UtcNow
        };

        await ApplyAmortissementCalculationAsync(entity, request);

        context.TableauxAmortissement.Add(entity);
        await context.SaveChangesAsync();

        logger.LogInformation("TableauAmortissement with ID {Numero} created successfully.", entity.Numero);

        return await ToResponseAsync(entity);
    }

    // RMANew (ListAmortissement.vb, ImporterAmortissement) : chargement en masse, sans
    // recalcul des champs d'amortissement (repris tels quels du fichier). Designation et
    // ImmobilisationConcernee sont résolues par nom (insensible à la casse) vers un
    // Building/TypologieImmobilisation existant - une ligne dont le nom ne correspond à
    // rien est rejetée et rapportée, plutôt que de créer une référence vide comme le
    // fait RMANew.
    public async Task<TableauAmortissementImportResult> ImportAsync(TableauAmortissementImportRequest request)
    {
        var result = new TableauAmortissementImportResult();
        int addUser = request.AddUser ?? 0;

        List<Building> buildings = await context.Buildings.ToListAsync();
        List<TypologieImmobilisation> typologies = await context.TypologiesImmobilisation.ToListAsync();

        for (int i = 0; i < request.Rows.Count; i++)
        {
            TableauAmortissementImportRow row = request.Rows[i];
            int ligne = i + 1;

            Building? building = buildings.FirstOrDefault(b =>
                string.Equals(b.Designation, row.Designation, StringComparison.OrdinalIgnoreCase));
            if (building == null)
            {
                result.Erreurs.Add(new TableauAmortissementImportError
                {
                    Ligne = ligne,
                    Motif = $"Actif introuvable : \"{row.Designation}\""
                });
                continue;
            }

            TypologieImmobilisation? typologie = typologies.FirstOrDefault(t =>
                string.Equals(t.ImmobilisationConcernee, row.ImmobilisationConcernee, StringComparison.OrdinalIgnoreCase));
            if (typologie == null)
            {
                result.Erreurs.Add(new TableauAmortissementImportError
                {
                    Ligne = ligne,
                    Motif = $"Typologie d'immobilisation introuvable : \"{row.ImmobilisationConcernee}\""
                });
                continue;
            }

            var entity = new TableauAmortissement
            {
                NoBuilding = building.Numero,
                ImmobConcernees = typologie.Numero,
                DateEntree = row.DateEntree,
                VaPrixAcquisition = row.VaPrixAcquisition,
                AmortiAnterieurs = row.AmortiAnterieurs,
                AmortiDbeneficebTaux = row.AmortiDbeneficebTaux,
                AmortiDbenficebDuree = row.AmortiDbenficebDuree,
                AmortiDbeneficebNorm = row.AmortiDbeneficebNorm,
                TotalAmortiAlaFin = row.TotalAmortiAlaFin,
                AddUser = addUser,
                AddDate = DateTime.UtcNow,
                ModUser = addUser,
                ModDate = DateTime.UtcNow
            };

            context.TableauxAmortissement.Add(entity);
            result.Importes++;
        }

        await context.SaveChangesAsync();

        logger.LogInformation("Imported {Count} TableauAmortissement rows ({Errors} errors).",
            result.Importes, result.Erreurs.Count);

        return result;
    }

    // RMANew (ListAmortissement.vb, ListAmortissement()) : dropdown listant chaque mois
    // entre le dernier mois validé (ou 11 mois en arrière si aucun) et le mois en cours.
    public async Task<List<AmortissementPeriodeOptionResponse>> GetPeriodesValidationAsync()
    {
        DateTime? dernierValide = await context.AmortissementValidations
            .OrderByDescending(v => v.Periode)
            .Select(v => (DateTime?)v.Periode)
            .FirstOrDefaultAsync();

        DateTime moisCourant = new(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        DateTime depart = dernierValide ?? moisCourant.AddMonths(-11);

        HashSet<DateTime> periodesValidees = (await context.AmortissementValidations
                .Select(v => v.Periode)
                .ToListAsync())
            .ToHashSet();

        var options = new List<AmortissementPeriodeOptionResponse>();
        for (DateTime mois = depart; mois <= moisCourant; mois = mois.AddMonths(1))
        {
            options.Add(new AmortissementPeriodeOptionResponse
            {
                Periode = mois,
                Valide = periodesValidees.Contains(mois)
            });
        }

        return options;
    }

    // RMANew (ListAmortissement.vb, GenererAmortissement) : accrue l'amortissement linéaire
    // de chaque ligne active non totalement amortie et échue pour le mois choisi, avec un
    // instantané dans TableauAmortissementVersion (équivalent de HistoriqueTableauAmortissement).
    // Contrairement à RMANew, la base de calcul (Construction/Aménagement/Prix d'acquisition
    // selon le type d'immobilisation) n'est pas reprise - RMANew la sélectionne via des
    // identifiants de typologie codés en dur (1-12) propres à sa propre base, non portables
    // vers les typologies (re)créées dans Smart-Building. La mensualité déjà stockée sur la
    // ligne (AmortiDbeneficebNorm, calculée à la création depuis VaPrixAcquisition) est
    // reprise telle quelle à la place, cohérent avec le reste du module (voir
    // ApplyAmortissementCalculationAsync, qui ne fait pas non plus cette distinction).
    public async Task<AmortissementValidationResultResponse> ValiderPeriodeAsync(AmortissementValidationRequest request)
    {
        DateTime periode = new(request.Periode.Year, request.Periode.Month, 1);

        bool dejaValidee = await context.AmortissementValidations.AnyAsync(v => v.Periode == periode);
        if (dejaValidee)
        {
            throw new InvalidOperationException("Cette période a déjà été validée.");
        }

        List<TableauAmortissement> lignes = await context.TableauxAmortissement
            .Where(t => !t.Inactif)
            .ToListAsync();

        int addUser = request.AddUser ?? 0;
        int lignesMisesAJour = 0;

        foreach (TableauAmortissement ligne in lignes)
        {
            if (ligne.TotalAmortiAlaFin >= ligne.VaPrixAcquisition)
            {
                continue;
            }

            if (ligne.AmortiDbeneficebNorm <= 0)
            {
                continue;
            }

            DateTime reference = ligne.DateProchaineAmorti ?? (ligne.DateEntree ?? periode).AddMonths(1);
            DateTime moisDebut = new(reference.Year, reference.Month, 1);

            if (moisDebut > periode)
            {
                continue;
            }

            int nbMois = ((periode.Year - moisDebut.Year) * 12) + periode.Month - moisDebut.Month + 1;
            if (nbMois <= 0)
            {
                continue;
            }

            decimal montantAnterieur = ligne.TotalAmortiAlaFin;
            decimal montant = Math.Round(nbMois * ligne.AmortiDbeneficebNorm, 2);
            decimal nouveauTotal = Math.Round(montantAnterieur + montant, 2);

            if (nouveauTotal >= ligne.VaPrixAcquisition)
            {
                montant = ligne.VaPrixAcquisition - montantAnterieur;
                nouveauTotal = ligne.VaPrixAcquisition;
            }

            context.TableauxAmortissementVersions.Add(new TableauAmortissementVersion
            {
                NoTableauAmortissement = ligne.Numero,
                AmortissementsAnterieurs = montantAnterieur,
                AmortissementsNormaux = montant,
                DateAmortissement = periode,
                AddUser = addUser,
                AddDate = DateTime.UtcNow,
                ModUser = addUser,
                ModDate = DateTime.UtcNow
            });

            ligne.AmortiAnterieurs = montantAnterieur;
            ligne.TotalAmortiAlaFin = nouveauTotal;
            ligne.DateProchaineAmorti = periode.AddMonths(1);
            ligne.ModUser = addUser;
            ligne.ModDate = DateTime.UtcNow;

            lignesMisesAJour++;
        }

        context.AmortissementValidations.Add(new AmortissementValidation
        {
            Periode = periode,
            AddUser = addUser,
            AddDate = DateTime.UtcNow,
            ModUser = addUser,
            ModDate = DateTime.UtcNow
        });

        await context.SaveChangesAsync();

        logger.LogInformation("Validated amortissement period {Periode} : {Count} rows updated.", periode, lignesMisesAJour);

        return new AmortissementValidationResultResponse
        {
            Periode = periode,
            LignesMisesAJour = lignesMisesAJour
        };
    }

    public async Task<TableauAmortissementResponse> UpdateAsync(int id, TableauAmortissementRequest request)
    {
        TableauAmortissement? entity = await context.TableauxAmortissement.FindAsync(id);
        if (entity == null)
        {
            throw new KeyNotFoundException("TableauAmortissement not found");
        }

        entity.NoBuilding = request.NoBuilding;
        entity.ImmobConcernees = request.ImmobConcernees;
        entity.DateEntree = request.DateEntree;
        entity.VaPrixAcquisition = request.VaPrixAcquisition;
        entity.ValeurTerrain = request.ValeurTerrain;
        entity.ValeurConstruction = request.ValeurConstruction;
        entity.ValeurAmenagement = request.ValeurAmenagement;
        entity.ImmobPrincipal = request.ImmobPrincipal;
        entity.Inactif = request.Inactif;
        entity.ModUser = request.ModUser ?? entity.ModUser;
        entity.ModDate = DateTime.UtcNow;

        await ApplyAmortissementCalculationAsync(entity, request);

        await context.SaveChangesAsync();

        logger.LogInformation("TableauAmortissement with ID {Id} updated successfully.", id);

        return await ToResponseAsync(entity);
    }

    public async Task<int> DeleteAsync(int id)
    {
        TableauAmortissement? entity = await context.TableauxAmortissement.FindAsync(id);
        if (entity == null)
        {
            return 0;
        }

        context.TableauxAmortissement.Remove(entity);
        int result = await context.SaveChangesAsync();

        logger.LogInformation("TableauAmortissement with ID {Id} deleted successfully.", id);

        return result;
    }
}

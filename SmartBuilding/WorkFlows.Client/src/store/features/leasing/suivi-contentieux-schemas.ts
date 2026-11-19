import { z } from 'zod';

export const SuiviContentieuxRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  // RMANew (DataEntrySuiviJuridique.vb) : ce formulaire n'a aucun champ Bail, en création
  // comme en édition - NoLocation n'y est jamais lu ni écrit.
  noLocation: z.number().int().nullable().optional(),
  natureProcedure: z.string().nullable().optional(),
  observation: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  statutDossier: z.string().nullable().optional(),
  dateDebutContentieux: z.string().nullable().optional(),
  dateEncaissement: z.string().nullable().optional(),
  montantEncaisse: z.number().nullable().optional(),
  soldeAnneePrecedente: z.number().nullable().optional(),
  pieceJointe: z.string().nullable().optional(),
});

export const SuiviContentieuxResponseSchema = z.object({
  numero: z.number().int(),
  noLocation: z.number().int().nullable().optional(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),

  natureProcedure: z.string().nullable().optional(),
  observation: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  statutDossier: z.string(),
  dateDebutContentieux: z.string().nullable().optional(),
  dateEncaissement: z.string().nullable().optional(),
  montantEncaisse: z.number().nullable().optional(),
  soldeAnneePrecedente: z.number().nullable().optional(),
  pieceJointe: z.string().nullable().optional(),

  montantImpaye: z.number(),
  avocatCount: z.number(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
});

export type SuiviContentieuxRequest = z.infer<typeof SuiviContentieuxRequestSchema>;
export type SuiviContentieuxResponse = z.infer<typeof SuiviContentieuxResponseSchema>;

// RMANew (DataEntrySuiviJuridique.aspx, ListStatutDossier) : le formulaire d'édition
// n'expose que ces 2 choix - "Nouveau"/"Dossier jugé"/"Accord amiable" existent côté
// affichage de la liste mais ne sont pas atteignables depuis ce formulaire.
export const STATUTS_DOSSIER = ['En Contentieux', 'Non Contentieux'] as const;

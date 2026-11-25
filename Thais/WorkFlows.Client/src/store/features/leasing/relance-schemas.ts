import { z } from 'zod';

export const RelanceRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noLocation: z.number().int({ message: 'Le bail est requis.' }).min(1, 'Le bail est requis.'),
  typeRelance: z.string().min(1, 'Le type de relance est requis.'),
  dateRelance: z.string().nullable().optional(),
  typeEnvoi: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const RelanceResponseSchema = z.object({
  numero: z.number().int(),
  noLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),

  typeRelance: z.string(),
  dateRelance: z.string(),
  typeEnvoi: z.string(),
  notes: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export const RelanceSummarySchema = z.object({
  noLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string(),
  nomBuilding: z.string(),
  nomLocal: z.string().nullable().optional(),
  etatBail: z.string().nullable().optional(),

  soldeImpaye: z.number(),
  nombreFacturesImpayees: z.number().int(),
  derniereRelanceType: z.string().nullable().optional(),
  derniereRelanceDate: z.string().nullable().optional(),
  nombreRelances: z.number().int(),
});

export type RelanceRequest = z.infer<typeof RelanceRequestSchema>;
export type RelanceResponse = z.infer<typeof RelanceResponseSchema>;
export type RelanceSummary = z.infer<typeof RelanceSummarySchema>;

export const TYPES_RELANCE = ['Lettre', 'Téléphonique', 'Mise en demeure'] as const;

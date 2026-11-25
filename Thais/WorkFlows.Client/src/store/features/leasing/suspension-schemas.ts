import { z } from 'zod';

export const SuspensionRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noContratLocation: z.number().int({ message: 'Le contrat est requis.' }).min(1, 'Le contrat est requis.'),

  motifSuspension: z.string().nullable().optional(),
  statutValidation: z.string().min(1),

  dateSuspension: z.string().nullable().optional(),
  dateArretSuspension: z.string().nullable().optional(),

  inactif: z.boolean().optional(),
});

export const SuspensionResponseSchema = z.object({
  numero: z.number().int(),

  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noContratLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),

  motifSuspension: z.string().nullable().optional(),
  statutValidation: z.string(),

  dateSuspension: z.string().nullable().optional(),
  dateArretSuspension: z.string().nullable().optional(),

  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type SuspensionRequest = z.infer<typeof SuspensionRequestSchema>;
export type SuspensionResponse = z.infer<typeof SuspensionResponseSchema>;

export const STATUTS_SUSPENSION = ['Nouveau', 'En instance', 'Validée'] as const;

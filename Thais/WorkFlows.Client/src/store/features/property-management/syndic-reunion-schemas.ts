import { z } from 'zod';

export const SyndicReunionRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  type: z.string().nullable().optional(),
  dateReunion: z.string().nullable().optional(),
  reglee: z.boolean().optional(),
  dateReglement: z.string().nullable().optional(),
  noVille: z.number().int().nullable().optional(),
  nombreQuotePart: z.number().int().nullable().optional(),
  quotePartAppelFonds: z.number().nullable().optional(),
  appelFondsAnnuel: z.number().nullable().optional(),
  pjConvocation: z.string().nullable().optional(),
  pjPV: z.string().nullable().optional(),
  pjAppelFonds: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  inactif: z.boolean().optional(),
});

export const SyndicReunionResponseSchema = z.object({
  numero: z.number().int(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  dateReunion: z.string().nullable().optional(),
  reglee: z.boolean(),
  dateReglement: z.string().nullable().optional(),
  noVille: z.number().int().nullable().optional(),
  nomVille: z.string().nullable().optional(),
  nombreQuotePart: z.number().int().nullable().optional(),
  quotePartAppelFonds: z.number().nullable().optional(),
  appelFondsAnnuel: z.number().nullable().optional(),
  pjConvocation: z.string().nullable().optional(),
  pjPV: z.string().nullable().optional(),
  pjAppelFonds: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export const SyndicImmeubleSummarySchema = z.object({
  noBuilding: z.number().int(),
  nomBuilding: z.string(),
  nombreQuotePart: z.number().int().nullable().optional(),
  nombreReunions: z.number().int(),
});

export type SyndicReunionRequest = z.infer<typeof SyndicReunionRequestSchema>;
export type SyndicReunionResponse = z.infer<typeof SyndicReunionResponseSchema>;
export type SyndicImmeubleSummary = z.infer<typeof SyndicImmeubleSummarySchema>;

export const TYPES_REUNION_SYNDIC = ['AGO', 'AGE'] as const;

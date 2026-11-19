import { z } from 'zod';

export const AssuranceRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  numPolice: z.string().nullable().optional(),
  noAssureur: z.number().int({ message: "L'assureur est requis." }).min(1, "L'assureur est requis."),
  noCourtier: z.number().int().nullable().optional(),
  typeCouverture: z.string().nullable().optional(),
  dateEffetContrat: z.string().nullable().optional(),
  montant: z.number().nullable().optional(),
  statut: z.string().min(1),
  notes: z.string().nullable().optional(),
  inactif: z.boolean().optional(),
});

export const AssuranceResponseSchema = z.object({
  numero: z.number().int(),
  numPolice: z.string().nullable().optional(),
  noAssureur: z.number().int(),
  nomAssureur: z.string().nullable().optional(),
  noCourtier: z.number().int().nullable().optional(),
  nomCourtier: z.string().nullable().optional(),
  typeCouverture: z.string().nullable().optional(),
  dateEffetContrat: z.string().nullable().optional(),
  montant: z.number().nullable().optional(),
  statut: z.string(),
  notes: z.string().nullable().optional(),
  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type AssuranceRequest = z.infer<typeof AssuranceRequestSchema>;
export type AssuranceResponse = z.infer<typeof AssuranceResponseSchema>;

export const STATUTS_ASSURANCE = ['EnCours', 'Terminé'] as const;

import { z } from 'zod';

export const FilialeRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),
  nom: z.string().min(1, 'La filiale est requise.'),
  numeroReference: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  rib: z.string().nullable().optional(),
  noBanque: z.number().int().nullable().optional(),
  modeReglement: z.string().nullable().optional(),
});

export const FilialeResponseSchema = z.object({
  numero: z.number().int(),
  nom: z.string(),
  numeroReference: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  rib: z.string().nullable().optional(),
  noBanque: z.number().int().nullable().optional(),
  nomBanque: z.string().nullable().optional(),
  modeReglement: z.string().nullable().optional(),
  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type FilialeRequest = z.infer<typeof FilialeRequestSchema>;
export type FilialeResponse = z.infer<typeof FilialeResponseSchema>;

export const MODES_REGLEMENT = [
  'Chèque',
  'Effet',
  'Virement',
  'Compensation',
  'Carte monétique',
  'Prélèvement',
  'Transfert',
  'Versement',
] as const;

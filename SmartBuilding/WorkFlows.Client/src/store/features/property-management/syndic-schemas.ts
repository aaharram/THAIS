import { z } from 'zod';

export const SyndicRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  nom: z.string().min(1, 'Le nom est requis.'),
  prenom: z.string().nullable().optional(),
  poste: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  debutMandat: z.string().nullable().optional(),
  finMandat: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  inactif: z.boolean().optional(),
});

export const SyndicResponseSchema = z.object({
  numero: z.number().int(),
  nom: z.string(),
  prenom: z.string().nullable().optional(),
  poste: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  debutMandat: z.string().nullable().optional(),
  finMandat: z.string().nullable().optional(),
  idSyndic: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type SyndicRequest = z.infer<typeof SyndicRequestSchema>;
export type SyndicResponse = z.infer<typeof SyndicResponseSchema>;

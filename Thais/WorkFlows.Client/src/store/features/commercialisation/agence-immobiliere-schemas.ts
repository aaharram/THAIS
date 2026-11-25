import { z } from 'zod';

export const AgenceImmobiliereRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  raisonSocial: z.string().min(1, 'La raison sociale est obligatoire.'),
  adresse: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  tele: z.string().nullable().optional(),
  contactPrincipal: z.string().nullable().optional(),
  teleContactPrincipal: z.string().nullable().optional(),

  inactif: z.boolean().optional(),
});

export const AgenceImmobiliereResponseSchema = z.object({
  numero: z.number().int(),

  raisonSocial: z.string(),
  adresse: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  tele: z.string().nullable().optional(),
  contactPrincipal: z.string().nullable().optional(),
  teleContactPrincipal: z.string().nullable().optional(),

  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type AgenceImmobiliereRequest = z.infer<typeof AgenceImmobiliereRequestSchema>;
export type AgenceImmobiliereResponse = z.infer<typeof AgenceImmobiliereResponseSchema>;

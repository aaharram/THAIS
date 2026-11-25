import { z } from 'zod';

export const PrestataireRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  designation: z.string().min(1, 'La désignation est requise.'),
  activite: z.string().nullable().optional(),
  typePrestataire: z.string().nullable().optional(),
  enseigne: z.string().nullable().optional(),
  rc: z.string().nullable().optional(),
  idf: z.string().nullable().optional(),
  ice: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  noVille: z.number().int().nullable().optional(),
  pays: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const PrestataireResponseSchema = z.object({
  numero: z.number().int(),
  designation: z.string(),
  activite: z.string().nullable().optional(),
  typePrestataire: z.string().nullable().optional(),
  enseigne: z.string().nullable().optional(),
  rc: z.string().nullable().optional(),
  idf: z.string().nullable().optional(),
  ice: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  noVille: z.number().int().nullable().optional(),
  nomVille: z.string().nullable().optional(),
  pays: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type PrestataireRequest = z.infer<typeof PrestataireRequestSchema>;
export type PrestataireResponse = z.infer<typeof PrestataireResponseSchema>;

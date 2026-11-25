import { z } from 'zod';

export const AvocatRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noContentieux: z.number().int().min(1),
  nom: z.string().nullable().optional(),
  prenom: z.string().nullable().optional(),
  cabinet: z.string().nullable().optional(),
  contrat: z.string().nullable().optional(),
  pieceJointe: z.string().nullable().optional(),
});

export const AvocatResponseSchema = z.object({
  numero: z.number().int(),
  noContentieux: z.number().int(),
  nom: z.string().nullable().optional(),
  prenom: z.string().nullable().optional(),
  cabinet: z.string().nullable().optional(),
  contrat: z.string().nullable().optional(),
  pieceJointe: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
});

export type AvocatRequest = z.infer<typeof AvocatRequestSchema>;
export type AvocatResponse = z.infer<typeof AvocatResponseSchema>;

import { z } from 'zod';

export const TypologieImmobilisationRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),
  immobilisationConcernee: z.string().min(1, "L'immobilisation concernée est requise."),
  compteComptable: z.string().nullable().optional(),
  compteAmortissement: z.string().nullable().optional(),
  compteDotation: z.string().nullable().optional(),
  taux: z.number().nullable().optional(),
  duree: z.number().int().nullable().optional(),
});

export const TypologieImmobilisationResponseSchema = z.object({
  numero: z.number().int(),
  immobilisationConcernee: z.string(),
  compteComptable: z.string().nullable().optional(),
  compteAmortissement: z.string().nullable().optional(),
  compteDotation: z.string().nullable().optional(),
  taux: z.number().nullable().optional(),
  duree: z.number().int().nullable().optional(),
  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type TypologieImmobilisationRequest = z.infer<typeof TypologieImmobilisationRequestSchema>;
export type TypologieImmobilisationResponse = z.infer<typeof TypologieImmobilisationResponseSchema>;

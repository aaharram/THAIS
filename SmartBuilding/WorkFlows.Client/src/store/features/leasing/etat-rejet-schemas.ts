import { z } from 'zod';

export const EtatRejetResponseSchema = z.object({
  numero: z.number().int(),
  datePaiement: z.string(),
  montant: z.number(),
  reference: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  numContratLocations: z.string().nullable().optional(),
  compteGeneral: z.string().nullable().optional(),
  codeImmeuble: z.string().nullable().optional(),
  nomEncaisseur: z.string().nullable().optional(),
  dateRejet: z.string().nullable().optional(),
});

export type EtatRejetResponse = z.infer<typeof EtatRejetResponseSchema>;

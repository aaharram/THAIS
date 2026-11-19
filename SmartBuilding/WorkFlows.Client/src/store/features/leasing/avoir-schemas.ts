import { z } from 'zod';

export const AvoirRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noFacture: z.number().int({ message: 'La facture est requise.' }).min(1, 'La facture est requise.'),
  dateAvoir: z.string().min(1, "La date de l'avoir est requise."),
  montant: z.number().positive({ message: 'Le montant doit être positif.' }),
  notes: z.string().nullable().optional(),
});

export const AvoirResponseSchema = z.object({
  numero: z.number().int(),
  noLocation: z.number().int(),
  noFacture: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  nomLocal: z.string().nullable().optional(),

  dateAvoir: z.string(),
  montant: z.number(),
  notes: z.string().nullable().optional(),

  montantFactureAvant: z.number(),
  montantFactureApres: z.number(),
  etatFactureApres: z.string(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type AvoirRequest = z.infer<typeof AvoirRequestSchema>;
export type AvoirResponse = z.infer<typeof AvoirResponseSchema>;

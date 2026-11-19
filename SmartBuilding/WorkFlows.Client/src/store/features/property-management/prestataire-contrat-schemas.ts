import { z } from 'zod';

export const PrestataireContratRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noPrestataire: z.number().int({ message: 'Le prestataire est requis.' }).min(1, 'Le prestataire est requis.'),
  objet: z.string().nullable().optional(),
  dateContrat: z.string().nullable().optional(),
  dateDebut: z.string().nullable().optional(),
  dateFin: z.string().nullable().optional(),
  montant: z.number().nullable().optional(),
  pieceJointe: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  inactif: z.boolean().optional(),
});

export const PrestataireContratResponseSchema = z.object({
  numero: z.number().int(),
  noPrestataire: z.number().int(),
  nomPrestataire: z.string().nullable().optional(),
  numeroContrat: z.string().nullable().optional(),
  objet: z.string().nullable().optional(),
  dateContrat: z.string().nullable().optional(),
  dateDebut: z.string().nullable().optional(),
  dateFin: z.string().nullable().optional(),
  montant: z.number().nullable().optional(),
  pieceJointe: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type PrestataireContratRequest = z.infer<typeof PrestataireContratRequestSchema>;
export type PrestataireContratResponse = z.infer<typeof PrestataireContratResponseSchema>;

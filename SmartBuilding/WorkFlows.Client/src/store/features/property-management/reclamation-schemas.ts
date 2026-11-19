import { z } from 'zod';

export const ReclamationRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noLocal: z.number().int().nullable().optional(),
  noLocataire: z.number().int({ message: 'Le locataire est requis.' }).min(1, 'Le locataire est requis.'),

  etat: z.string().nullable().optional(),
  dateReclamation: z.string().nullable().optional(),
  objet: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const ReclamationResponseSchema = z.object({
  numero: z.number().int(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noLocal: z.number().int().nullable().optional(),
  nomLocal: z.string().nullable().optional(),
  noLocataire: z.number().int(),
  nomLocataire: z.string().nullable().optional(),

  etat: z.string(),
  dateReclamation: z.string().nullable().optional(),
  objet: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type ReclamationRequest = z.infer<typeof ReclamationRequestSchema>;
export type ReclamationResponse = z.infer<typeof ReclamationResponseSchema>;

export const ETATS_RECLAMATION = ['Ouverte', 'En traitement', 'Résolue', 'Fermée'] as const;

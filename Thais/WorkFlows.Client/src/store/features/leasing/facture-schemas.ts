import { z } from 'zod';

export const FactureRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noLocation: z.number().int({ message: 'Le bail est requis.' }).min(1, 'Le bail est requis.'),
  periode: z.string().min(1, 'La période est requise.'),
  dateEcheance: z.string().nullable().optional(),
  typeFacture: z.string().nullable().optional(),

  loyerNet: z.number().nullable().optional(),
  charges: z.number().nullable().optional(),
  tva: z.number().nullable().optional(),
  taxe: z.number().nullable().optional(),
  autres: z.number().nullable().optional(),

  notes: z.string().nullable().optional(),
});

export const FactureResponseSchema = z.object({
  numero: z.number().int(),
  reference: z.string().nullable().optional(),
  noLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  nomLocal: z.string().nullable().optional(),
  nomProprietaire: z.string().nullable().optional(),
  noBuilding: z.number().int().nullable().optional(),
  noProprietaire: z.number().int().nullable().optional(),
  codeLocataire: z.string().nullable().optional(),
  compteGeneral: z.string().nullable().optional(),
  etage: z.string().nullable().optional(),

  periode: z.string(),
  dateEmission: z.string(),
  dateEcheance: z.string().nullable().optional(),

  loyerNet: z.number().nullable().optional(),
  charges: z.number().nullable().optional(),
  tva: z.number().nullable().optional(),
  taxe: z.number().nullable().optional(),
  autres: z.number().nullable().optional(),
  montant: z.number(),
  typeFacture: z.string(),

  etat: z.string(),
  edite: z.boolean(),
  demandeAnnulation: z.boolean(),
  dateAnnulation: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type FactureRequest = z.infer<typeof FactureRequestSchema>;
export type FactureResponse = z.infer<typeof FactureResponseSchema>;

export const ETATS_FACTURE = ['Impayée', 'Partiellement payée', 'Payée', 'Annulée'] as const;
export const TYPES_FACTURE = ['LoyerM', 'Loyer', 'Caution', 'Reliquat'] as const;

import { z } from 'zod';

export const BailRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  numContratLocations: z.string().nullable().optional(),
  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noLocal: z.number().int({ message: 'Le local est requis.' }).min(1, 'Le local est requis.'),
  noLocataire: z.number().int({ message: 'Le locataire est requis.' }).min(1, 'Le locataire est requis.'),
  noEncaisseur: z.number().int().nullable().optional(),
  noPeriodicity: z.number().int().nullable().optional(),

  usage: z.string().nullable().optional(),
  dateDebut: z.string().nullable().optional(),
  dateGestion: z.string().nullable().optional(),
  dateFin: z.string().nullable().optional(),
  franchise: z.number().int().nullable().optional(),

  loyerNet: z.number().nullable().optional(),
  charges: z.number().nullable().optional(),
  tva: z.number().nullable().optional(),
  taxe: z.number().nullable().optional(),
  loyerGarage: z.number().nullable().optional(),
  autres: z.number().nullable().optional(),

  genererQuittance: z.boolean().optional(),
  garantie: z.number().nullable().optional(),
  caution: z.number().nullable().optional(),
  modeReglement: z.string().nullable().optional(),
  etat: z.string().min(1),

  notes: z.string().nullable().optional(),
  inactif: z.boolean().optional(),
});

export const BailResponseSchema = z.object({
  numero: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noLocal: z.number().int(),
  nomLocal: z.string().nullable().optional(),
  etage: z.string().nullable().optional(),
  surface: z.number().nullable().optional(),
  noLocataire: z.number().int(),
  nomLocataire: z.string().nullable().optional(),
  noEncaisseur: z.number().int().nullable().optional(),
  nomEncaisseur: z.string().nullable().optional(),
  noPeriodicity: z.number().int().nullable().optional(),
  nomPeriodicity: z.string().nullable().optional(),

  usage: z.string().nullable().optional(),
  dateDebut: z.string().nullable().optional(),
  dateGestion: z.string().nullable().optional(),
  dateFin: z.string().nullable().optional(),
  franchise: z.number().int().nullable().optional(),

  loyerNet: z.number().nullable().optional(),
  charges: z.number().nullable().optional(),
  tva: z.number().nullable().optional(),
  taxe: z.number().nullable().optional(),
  loyerGarage: z.number().nullable().optional(),
  autres: z.number().nullable().optional(),
  montant: z.number().nullable().optional(),

  genererQuittance: z.boolean(),
  garantie: z.number().nullable().optional(),
  caution: z.number().nullable().optional(),
  modeReglement: z.string().nullable().optional(),
  etat: z.string(),

  notes: z.string().nullable().optional(),
  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type BailRequest = z.infer<typeof BailRequestSchema>;
export type BailResponse = z.infer<typeof BailResponseSchema>;

export const ETATS_BAIL = ['En cours de location', 'Location Terminée', 'Suspendu'] as const;
export const MODES_REGLEMENT = ['Chèque', 'Effet', 'Virement', 'Compensation', 'Carte monétique'] as const;

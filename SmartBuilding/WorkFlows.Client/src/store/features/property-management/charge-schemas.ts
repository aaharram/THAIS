import { z } from 'zod';

export const ChargeRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noTypologieCharge: z.number().int({ message: 'La typologie est requise.' }).min(1, 'La typologie est requise.'),
  noPrestataire: z.number().int().nullable().optional(),

  annee: z.number().int({ message: "L'année est requise." }).min(1900, "L'année est requise."),
  montant: z.number().nullable().optional(),
  realisation: z.number().nullable().optional(),
  dateDecaissement: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  inactif: z.boolean().optional(),
});

export const ChargeResponseSchema = z.object({
  numero: z.number().int(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noTypologieCharge: z.number().int(),
  nomTypologieCharge: z.string().nullable().optional(),
  noPrestataire: z.number().int().nullable().optional(),
  nomPrestataire: z.string().nullable().optional(),

  annee: z.number().int(),
  montant: z.number().nullable().optional(),
  realisation: z.number().nullable().optional(),
  ecart: z.number().nullable().optional(),
  dateDecaissement: z.string().nullable().optional(),
  codeCharge: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type ChargeRequest = z.infer<typeof ChargeRequestSchema>;
export type ChargeResponse = z.infer<typeof ChargeResponseSchema>;

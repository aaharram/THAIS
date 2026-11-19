import { z } from 'zod';

export const TaxeRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noLocal: z.number().int().nullable().optional(),
  noLocataire: z.number().int().nullable().optional(),
  noType: z.number().int({ message: 'Le type de taxe est requis.' }).min(1, 'Le type de taxe est requis.'),

  idFiscal: z.string().nullable().optional(),
  noArticle: z.string().nullable().optional(),
  montantTaxe: z.number().nullable().optional(),
  annee: z.number().int({ message: "L'année est requise." }).min(1900, "L'année est requise."),
  paye: z.boolean().optional(),
  notes: z.string().nullable().optional(),

  inactif: z.boolean().optional(),
});

export const TaxeResponseSchema = z.object({
  numero: z.number().int(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noLocal: z.number().int().nullable().optional(),
  nomLocal: z.string().nullable().optional(),
  noLocataire: z.number().int().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  noType: z.number().int(),
  nomType: z.string().nullable().optional(),

  idFiscal: z.string().nullable().optional(),
  noArticle: z.string().nullable().optional(),
  montantTaxe: z.number().nullable().optional(),
  annee: z.number().int(),
  paye: z.boolean(),
  notes: z.string().nullable().optional(),

  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type TaxeRequest = z.infer<typeof TaxeRequestSchema>;
export type TaxeResponse = z.infer<typeof TaxeResponseSchema>;

import { z } from 'zod';

export const EtatLoyerLigneSchema = z.object({
  noLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  locataire: z.string().nullable().optional(),
  revenu: z.number(),
  encaissement: z.number(),
  enc: z.number(),
  autres: z.number(),
  impaye: z.number(),
  nbMoisImpaye: z.number().int(),
  dateLimitePai: z.string().nullable().optional(),
});

export const EtatLoyerBuildingSchema = z.object({
  noBuilding: z.number().int(),
  immeuble: z.string().nullable().optional(),
  codeImmeuble: z.string().nullable().optional(),
  compteGeneral: z.string().nullable().optional(),
  nAffectation: z.string().nullable().optional(),
  lignes: z.array(EtatLoyerLigneSchema),
  revenuTotal: z.number(),
  encaissementTotal: z.number(),
  impayeTotal: z.number(),
});

export const EtatLoyerResponseSchema = z.object({
  annee: z.number().int(),
  mois: z.number().int(),
  valide: z.boolean(),
  dateValidation: z.string().nullable().optional(),
  buildings: z.array(EtatLoyerBuildingSchema),
  revenuGrandTotal: z.number(),
  encaissementGrandTotal: z.number(),
  impayeGrandTotal: z.number(),
});

export const PeriodeValideeSchema = z.object({
  annee: z.number().int(),
  mois: z.number().int(),
  dateValidation: z.string(),
});

export type EtatLoyerLigne = z.infer<typeof EtatLoyerLigneSchema>;
export type EtatLoyerBuilding = z.infer<typeof EtatLoyerBuildingSchema>;
export type EtatLoyerResponse = z.infer<typeof EtatLoyerResponseSchema>;
export type PeriodeValidee = z.infer<typeof PeriodeValideeSchema>;

export const MOIS = [
  { value: 1, label: 'Janvier' },
  { value: 2, label: 'Février' },
  { value: 3, label: 'Mars' },
  { value: 4, label: 'Avril' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Juin' },
  { value: 7, label: 'Juillet' },
  { value: 8, label: 'Août' },
  { value: 9, label: 'Septembre' },
  { value: 10, label: 'Octobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Décembre' },
] as const;

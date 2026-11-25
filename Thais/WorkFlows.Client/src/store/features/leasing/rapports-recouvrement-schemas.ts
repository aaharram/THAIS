import { z } from 'zod';

export const EtatImpayeLigneSchema = z.object({
  noProprietaire: z.number().int().nullable().optional(),
  proprietaire: z.string().nullable().optional(),
  montantImpaye: z.number(),
  nbDossiers: z.number().int(),
});

export const EtatImpayeResponseSchema = z.object({
  lignes: z.array(EtatImpayeLigneSchema),
  totalImpaye: z.number(),
  totalDossiers: z.number().int(),
});

export const ApercuEmissionsEncaissementSchema = z.object({
  annee: z.number().int(),
  mois: z.number().int(),
  totalEmissions: z.number(),
  totalEncaissement: z.number(),
  tauxEncaissement: z.number(),
  nbFactures: z.number().int(),
});

export const SuiviEncaissementLigneSchema = z.object({
  noPaiement: z.number().int(),
  locataire: z.string().nullable().optional(),
  etage: z.string().nullable().optional(),
  local: z.string().nullable().optional(),
  modePaiement: z.string().nullable().optional(),
  datePaiement: z.string(),
  montant: z.number(),
  encaisseur: z.string().nullable().optional(),
  loyerNet: z.number().nullable().optional(),
  charges: z.number().nullable().optional(),
  taxe: z.number().nullable().optional(),
  tva: z.number().nullable().optional(),
  totalMois: z.number().nullable().optional(),
});

export const SuiviEncaissementBuildingSchema = z.object({
  noBuilding: z.number().int(),
  immeuble: z.string().nullable().optional(),
  codeImmeuble: z.string().nullable().optional(),
  lignes: z.array(SuiviEncaissementLigneSchema),
  totalEncaissement: z.number(),
});

export const SuiviEncaissementResponseSchema = z.object({
  buildings: z.array(SuiviEncaissementBuildingSchema),
  grandTotal: z.number(),
});

export const RapportEncaisseurLigneSchema = z.object({
  mois: z.number().int(),
  emissions: z.number(),
  encaissement: z.number(),
  nbFactures: z.number().int(),
  tauxEncaissement: z.number(),
});

export const RapportEncaisseurResponseSchema = z.object({
  annee: z.number().int(),
  noEncaisseur: z.number().int().nullable().optional(),
  lignes: z.array(RapportEncaisseurLigneSchema),
  totalEmissions: z.number(),
  totalEncaissement: z.number(),
  tauxGlobal: z.number(),
});

export const PrimeEncaisseurLigneSchema = z.object({
  noEncaisseur: z.number().int(),
  encaisseur: z.string().nullable().optional(),
  nbFacturesMoisCourant: z.number().int(),
  nbFacturesMoisPrecedent: z.number().int(),
  emission: z.number(),
  encaissement: z.number(),
  pourcentage: z.number().nullable().optional(),
  primeForfait: z.number(),
  bonus: z.number(),
  totalPrime: z.number(),
});

export const PrimeEncaisseurResponseSchema = z.object({
  annee: z.number().int(),
  mois: z.number().int(),
  lignes: z.array(PrimeEncaisseurLigneSchema),
  totalPrime: z.number(),
});

export type EtatImpayeResponse = z.infer<typeof EtatImpayeResponseSchema>;
export type ApercuEmissionsEncaissement = z.infer<typeof ApercuEmissionsEncaissementSchema>;
export type SuiviEncaissementResponse = z.infer<typeof SuiviEncaissementResponseSchema>;
export type RapportEncaisseurResponse = z.infer<typeof RapportEncaisseurResponseSchema>;
export type PrimeEncaisseurResponse = z.infer<typeof PrimeEncaisseurResponseSchema>;

import { z } from 'zod';

export const EtatReglementaireLigneSchema = z.object({
  noBuilding: z.number().int(),
  codeImmeuble: z.string().nullable().optional(),
  titreFoncier: z.string().nullable().optional(),
  designation: z.string().nullable().optional(),
  valeurEntree: z.number(),
  amortissementCumule: z.number(),
  valeurInventaire: z.number(),
  valeurRealisation: z.number().nullable().optional(),
  moinsValueGlobale: z.number(),
  vie: z.number(),
  nonVie: z.number(),
  gsr: z.number(),
  autres: z.number(),
  revenusLocatifs: z.number().nullable().optional(),
});

export const EtatReglementaireResponseSchema = z.object({
  type: z.string(),
  lignes: z.array(EtatReglementaireLigneSchema),
  totalValeurEntree: z.number(),
  totalAmortissementCumule: z.number(),
  totalValeurInventaire: z.number(),
  totalValeurRealisation: z.number(),
  totalVie: z.number(),
  totalNonVie: z.number(),
  totalGsr: z.number(),
  totalAutres: z.number(),
  totalRevenusLocatifs: z.number().nullable().optional(),
});

export type EtatReglementaireLigne = z.infer<typeof EtatReglementaireLigneSchema>;
export type EtatReglementaireResponse = z.infer<typeof EtatReglementaireResponseSchema>;

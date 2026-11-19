import { z } from 'zod';

export const PrestationAchatRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBonCommande: z.number().int({ message: 'Le bon de commande est requis.' }).min(1, 'Le bon de commande est requis.'),
  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noTypologieCharge: z.number().int({ message: 'La typologie est requise.' }).min(1, 'La typologie est requise.'),

  prixUnitaireHT: z.number({ message: 'Le prix unitaire HT est requis.' }).min(0, 'Le prix unitaire HT est requis.'),
  quantite: z.number().nullable().optional(),
  tauxTVA: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const PrestationAchatResponseSchema = z.object({
  numero: z.number().int(),
  noBonCommande: z.number().int(),
  numeroBonCommande: z.string().nullable().optional(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noTypologieCharge: z.number().int(),
  nomTypologieCharge: z.string().nullable().optional(),

  prixUnitaireHT: z.number(),
  quantite: z.number(),
  tauxTVA: z.number().nullable().optional(),
  montantTTC: z.number(),

  dureeAmortissementMois: z.number().int().nullable().optional(),
  tauxAmortissement: z.number().nullable().optional(),
  estAmorti: z.boolean(),
  eligibleAmortissement: z.boolean(),
  notes: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type PrestationAchatRequest = z.infer<typeof PrestationAchatRequestSchema>;
export type PrestationAchatResponse = z.infer<typeof PrestationAchatResponseSchema>;

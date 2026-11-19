import { z } from 'zod';

export const TaxeHabitationLigneSchema = z.object({
  article: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  etage: z.string().nullable().optional(),
  nomLocal: z.string().nullable().optional(),
  superficie: z.number().nullable().optional(),
  usage: z.string().nullable().optional(),
  loyerNetAnnuel: z.number(),
});

export const TaxeHabitationBuildingSchema = z.object({
  noBuilding: z.number().int(),
  nomBuilding: z.string(),
  codeImmeuble: z.string().nullable().optional(),
  totalActif: z.number(),
  lignes: z.array(TaxeHabitationLigneSchema),
});

export type TaxeHabitationLigne = z.infer<typeof TaxeHabitationLigneSchema>;
export type TaxeHabitationBuilding = z.infer<typeof TaxeHabitationBuildingSchema>;

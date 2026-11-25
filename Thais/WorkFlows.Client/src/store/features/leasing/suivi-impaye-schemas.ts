import { z } from 'zod';

export const SuiviImpayeLigneResponseSchema = z.object({
  noLocation: z.number().int(),
  nomLocataire: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  loyerMensuel: z.number().nullable().optional(),
  periodeImpayesDebut: z.string().nullable().optional(),
  periodeImpayesFin: z.string().nullable().optional(),
  nbMoisImpaye: z.number().int(),
  montantImpaye: z.number(),
  contentieux: z.boolean(),
  nomEncaisseur: z.string().nullable().optional(),
});

export type SuiviImpayeLigneResponse = z.infer<typeof SuiviImpayeLigneResponseSchema>;

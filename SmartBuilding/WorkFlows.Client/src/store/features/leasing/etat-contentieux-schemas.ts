import { z } from 'zod';

export const EtatContentieuxResponseSchema = z.object({
  dateDebutContentieux: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  ville: z.string().nullable().optional(),
  compteGeneral: z.string().nullable().optional(),
  numContratLocations: z.string().nullable().optional(),
  enCours: z.boolean(),
  dateResiliation: z.string().nullable().optional(),
  loyerMensuel: z.number().nullable().optional(),
  soldeAnneePrecedente: z.number().nullable().optional(),
  emissionsAnneeCourante: z.number(),
  reglementsAnneeCourante: z.number(),
  soldeActuel: z.number(),
});

export type EtatContentieuxResponse = z.infer<typeof EtatContentieuxResponseSchema>;

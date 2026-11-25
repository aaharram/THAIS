import { z } from 'zod';

export const ImpayesParAgeBuildingSchema = z.object({
  noBuilding: z.number().int(),
  immeuble: z.string().nullable().optional(),
  codeImmeuble: z.string().nullable().optional(),
  moinsDe3Mois: z.number(),
  entre3Et6Mois: z.number(),
  entre6MoisEt1An: z.number(),
  plusDe12Mois: z.number(),
  total: z.number(),
  provisionDouteux: z.number(),
  provisionContentieux: z.number(),
  totalProvision: z.number(),
});

export const ImpayesParAgeResponseSchema = z.object({
  buildings: z.array(ImpayesParAgeBuildingSchema),
  totalMoinsDe3Mois: z.number(),
  totalEntre3Et6Mois: z.number(),
  totalEntre6MoisEt1An: z.number(),
  totalPlusDe12Mois: z.number(),
  totalGeneral: z.number(),
  totalProvisionDouteux: z.number(),
  totalProvisionContentieux: z.number(),
  totalProvision: z.number(),
});

export type ImpayesParAgeBuilding = z.infer<typeof ImpayesParAgeBuildingSchema>;
export type ImpayesParAgeResponse = z.infer<typeof ImpayesParAgeResponseSchema>;

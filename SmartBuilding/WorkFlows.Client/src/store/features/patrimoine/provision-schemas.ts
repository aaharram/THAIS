import { z } from 'zod';

export const ProvisionRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  montantProvision: z.number().nullable().optional(),
  dateProvision: z.string().nullable().optional(),
});

export const ProvisionResponseSchema = z.object({
  numero: z.number().int(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  montantProvision: z.number().nullable().optional(),
  dateProvision: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type ProvisionRequest = z.infer<typeof ProvisionRequestSchema>;
export type ProvisionResponse = z.infer<typeof ProvisionResponseSchema>;

import { z } from 'zod';

export const LocalVacantResponseSchema = z.object({
  numero: z.number().int(),
  nomProprietaire: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  nomLocal: z.string(),
  etage: z.string().nullable().optional(),
  superficie: z.number().nullable().optional(),
  adresse: z.string().nullable().optional(),
});

export type LocalVacantResponse = z.infer<typeof LocalVacantResponseSchema>;

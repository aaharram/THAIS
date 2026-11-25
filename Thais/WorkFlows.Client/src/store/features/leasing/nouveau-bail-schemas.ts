import { z } from 'zod';

export const NouveauBailResponseSchema = z.object({
  numero: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  dateDebut: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  usage: z.string().nullable().optional(),
  etage: z.string().nullable().optional(),
  loyerMensuel: z.number().nullable().optional(),
  cumulMontant: z.number(),
  numContratLocations: z.string().nullable().optional(),
  nomLocal: z.string().nullable().optional(),
  superficie: z.number().nullable().optional(),
  loyerDeBase: z.number().nullable().optional(),
  dateFin: z.string().nullable().optional(),
  dateRevision: z.string().nullable().optional(),
  dateProchaineRevision: z.string().nullable().optional(),
});

export type NouveauBailResponse = z.infer<typeof NouveauBailResponseSchema>;

import { z } from 'zod';

export const ProspectionRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  description: z.string().nullable().optional(),
  typologie: z.number().int().nullable().optional(),
  typeOperation: z.number().int().nullable().optional(),
  situationProspection: z.number().int().nullable().optional(),

  dateAjout: z.string().nullable().optional(),
  dateAdjudication: z.string().nullable().optional(),
  dateContrat: z.string().nullable().optional(),

  notes: z.string().nullable().optional(),

  pv: z.string().nullable().optional(),
  avisBPP: z.string().nullable().optional(),
  avisDPAL: z.string().nullable().optional(),
  supportCA: z.string().nullable().optional(),
  businesPlan: z.string().nullable().optional(),

  inactif: z.boolean().optional(),
});

export const ProspectionResponseSchema = z.object({
  numero: z.number().int(),

  description: z.string().nullable().optional(),
  typologie: z.number().int().nullable().optional(),
  typeOperation: z.number().int().nullable().optional(),
  situationProspection: z.number().int().nullable().optional(),
  nbBien: z.number().int(),

  dateAjout: z.string().nullable().optional(),
  dateAdjudication: z.string().nullable().optional(),
  dateContrat: z.string().nullable().optional(),

  notes: z.string().nullable().optional(),

  pv: z.string().nullable().optional(),
  avisBPP: z.string().nullable().optional(),
  avisDPAL: z.string().nullable().optional(),
  supportCA: z.string().nullable().optional(),
  businesPlan: z.string().nullable().optional(),

  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type ProspectionRequest = z.infer<typeof ProspectionRequestSchema>;
export type ProspectionResponse = z.infer<typeof ProspectionResponseSchema>;

export const DESTINATIONS_PROSPECTION = [
  { value: 2, label: 'Agence' },
  { value: 11, label: 'Annexes habitables et non habitables' },
  { value: 19, label: 'Autres' },
  { value: 3, label: 'Directions régionales' },
  { value: 15, label: 'Emplacements pour GAB sur sites externes' },
  { value: 16, label: 'Locaux de substitutions' },
  { value: 13, label: 'Logements de vacances' },
  { value: 18, label: 'parking' },
  { value: 1, label: 'Sièges' },
] as const;

export const NATURES_OFFRE = [
  { value: 0, label: 'Location' },
  { value: 1, label: 'Acquisition' },
  { value: 2, label: 'Location ou Acquisition' },
] as const;

export const STATUTS_PROSPECTION = [
  { value: 0, label: 'Encours' },
  { value: 1, label: 'Terminée' },
] as const;

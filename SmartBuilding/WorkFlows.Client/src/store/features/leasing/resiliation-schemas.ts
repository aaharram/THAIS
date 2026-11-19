import { z } from 'zod';

export const ResiliationRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noContrat: z.number().int({ message: 'Le contrat est requis.' }).min(1, 'Le contrat est requis.'),

  typeResiliation: z.string().min(1),
  motifResiliation: z.string().min(1, 'Le motif de résiliation est obligatoire.'),
  durePreavis: z.string().min(1, 'La durée de préavis est obligatoire.'),
  origineResiliation: z.string().min(1),
  statutValidation: z.string().min(1),

  dateResiliation: z.string().min(1, 'La date de résiliation est obligatoire.'),
  dateReception: z.string().nullable().optional(),
  dateRestitutionActif: z.string().nullable().optional(),

  inactif: z.boolean().optional(),
});

export const ResiliationResponseSchema = z.object({
  numero: z.number().int(),

  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noContrat: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  dateDebutLocation: z.string().nullable().optional(),
  etage: z.string().nullable().optional(),
  loyerMensuel: z.number().nullable().optional(),

  typeResiliation: z.string(),
  motifResiliation: z.string().nullable().optional(),
  durePreavis: z.string().nullable().optional(),
  origineResiliation: z.string(),
  statutValidation: z.string(),

  dateResiliation: z.string().nullable().optional(),
  dateReception: z.string().nullable().optional(),
  dateRestitutionActif: z.string().nullable().optional(),

  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type ResiliationRequest = z.infer<typeof ResiliationRequestSchema>;
export type ResiliationResponse = z.infer<typeof ResiliationResponseSchema>;

export const TYPES_RESILIATION = ['Amiable', 'judicaire'] as const;
export const ORIGINES_RESILIATION = ['Client', 'RMA'] as const;
export const STATUTS_RESILIATION = ['Nouveau', 'En instance', 'Validée'] as const;

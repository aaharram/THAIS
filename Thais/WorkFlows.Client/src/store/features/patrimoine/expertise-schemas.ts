import { z } from 'zod';

export const ExpertiseRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  cabinetExpert: z.string().min(1, "Le cabinet d'expert est requis."),
  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noLocal: z.number().int({ message: 'Le local est requis.' }).min(1, 'Le local est requis.'),

  valeurTerrain: z.number().nullable().optional(),
  valeurConstruction: z.number().nullable().optional(),
  valeurExpertiseActualiser: z.number().nullable().optional(),
  dateExpertiseActualiser: z.string().nullable().optional(),
  pieceJointe: z.string().nullable().optional(),
});

export const ExpertiseResponseSchema = z.object({
  numero: z.number().int(),
  cabinetExpert: z.string(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noLocal: z.number().int(),
  nomLocal: z.string().nullable().optional(),

  valeurTerrain: z.number().nullable().optional(),
  valeurConstruction: z.number().nullable().optional(),
  valeurExpertiseActualiser: z.number().nullable().optional(),
  dateExpertiseActualiser: z.string().nullable().optional(),
  pieceJointe: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export const ExpertiseSummarySchema = z.object({
  noBuilding: z.number().int(),
  nomBuilding: z.string(),
  noLocal: z.number().int(),
  nomLocal: z.string().nullable().optional(),
  titreFoncier: z.string().nullable().optional(),
  surfaceUtile: z.number().nullable().optional(),
  valeurEntree: z.number().nullable().optional(),
  derniereExpertise: z.number().nullable().optional(),
  dateDerniereExpertise: z.string().nullable().optional(),
  derniereExpertiseNumero: z.number().int(),
  pieceJointe: z.string().nullable().optional(),
  nombreVersions: z.number().int(),
});

export type ExpertiseRequest = z.infer<typeof ExpertiseRequestSchema>;
export type ExpertiseResponse = z.infer<typeof ExpertiseResponseSchema>;
export type ExpertiseSummary = z.infer<typeof ExpertiseSummarySchema>;

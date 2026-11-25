import { z } from 'zod';

export const TableauAmortissementRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  immobConcernees: z
    .number()
    .int({ message: "L'immobilisation concernée est requise." })
    .min(1, "L'immobilisation concernée est requise."),

  dateEntree: z.string().nullable().optional(),
  vaPrixAcquisition: z.number({ message: "La valeur d'entrée est requise." }),

  valeurTerrain: z.number().nullable().optional(),
  valeurConstruction: z.number().nullable().optional(),
  valeurAmenagement: z.number().nullable().optional(),

  immobPrincipal: z.boolean().optional(),
  inactif: z.boolean().optional(),
});

export const TableauAmortissementVersionSchema = z.object({
  numero: z.number().int(),
  amortissementsAnterieurs: z.number(),
  amortissementsNormaux: z.number(),
  dateAmortissement: z.string(),
});

export const TableauAmortissementResponseSchema = z.object({
  numero: z.number().int(),

  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  titreFoncier: z.string().nullable().optional(),
  compteComptable: z.string().nullable().optional(),
  compteGeneral: z.string().nullable().optional(),
  nAffectation: z.string().nullable().optional(),

  immobConcernees: z.number().int(),
  nomImmobConcernees: z.string().nullable().optional(),

  dateEntree: z.string().nullable().optional(),
  vaPrixAcquisition: z.number(),

  valeurTerrain: z.number().nullable().optional(),
  valeurConstruction: z.number().nullable().optional(),
  valeurAmenagement: z.number().nullable().optional(),

  amortiAnterieurs: z.number(),
  amortiDbeneficebTaux: z.number(),
  amortiDbenficebDuree: z.number().int(),
  amortiDbeneficebNorm: z.number(),
  totalAmortiAlaFin: z.number(),
  dateProchaineAmorti: z.string().nullable().optional(),

  immobPrincipal: z.boolean(),
  inactif: z.boolean(),

  versions: z.array(TableauAmortissementVersionSchema),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type TableauAmortissementRequest = z.infer<typeof TableauAmortissementRequestSchema>;
export type TableauAmortissementResponse = z.infer<typeof TableauAmortissementResponseSchema>;

export const TableauAmortissementImportRowSchema = z.object({
  designation: z.string(),
  immobilisationConcernee: z.string(),
  dateEntree: z.string().nullable().optional(),
  vaPrixAcquisition: z.number(),
  amortiAnterieurs: z.number(),
  amortiDbeneficebTaux: z.number(),
  amortiDbenficebDuree: z.number().int(),
  amortiDbeneficebNorm: z.number(),
  totalAmortiAlaFin: z.number(),
});

export const TableauAmortissementImportRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  rows: z.array(TableauAmortissementImportRowSchema),
});

export const TableauAmortissementImportResultSchema = z.object({
  importes: z.number().int(),
  erreurs: z.array(z.object({ ligne: z.number().int(), motif: z.string() })),
});

export type TableauAmortissementImportRow = z.infer<typeof TableauAmortissementImportRowSchema>;
export type TableauAmortissementImportRequest = z.infer<typeof TableauAmortissementImportRequestSchema>;
export type TableauAmortissementImportResult = z.infer<typeof TableauAmortissementImportResultSchema>;

export const AmortissementPeriodeOptionSchema = z.object({
  periode: z.string(),
  valide: z.boolean(),
});

export const AmortissementValidationRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  periode: z.string(),
});

export const AmortissementValidationResultSchema = z.object({
  periode: z.string(),
  lignesMisesAJour: z.number().int(),
});

export type AmortissementPeriodeOption = z.infer<typeof AmortissementPeriodeOptionSchema>;
export type AmortissementValidationRequest = z.infer<typeof AmortissementValidationRequestSchema>;
export type AmortissementValidationResult = z.infer<typeof AmortissementValidationResultSchema>;

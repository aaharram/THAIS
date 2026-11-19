import { z } from 'zod';

export const RevisionLoyerRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noLocation: z.number().int({ message: 'Le bail est requis.' }).min(1, 'Le bail est requis.'),

  ancienLoyer: z.number().nullable().optional(),
  nouveauLoyer: z.number().nullable().optional(),
  tauxRevision: z.number().nullable().optional(),
  dateRevision: z.string().nullable().optional(),
  dateProchaineRevision: z.string().nullable().optional(),
  reliquat: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const RevisionLoyerResponseSchema = z.object({
  numero: z.number().int(),
  noLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  nomLocal: z.string().nullable().optional(),

  ancienLoyer: z.number().nullable().optional(),
  nouveauLoyer: z.number().nullable().optional(),
  tauxRevision: z.number().nullable().optional(),
  dateRevision: z.string(),
  dateProchaineRevision: z.string().nullable().optional(),
  reliquat: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

// Une ligne par bail actif éligible à la révision (RevisionsLoyers.aspx côté RMANew).
export const RevisionLoyerSummarySchema = z.object({
  noLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string(),
  nomBuilding: z.string(),
  nomLocal: z.string().nullable().optional(),
  usage: z.string().nullable().optional(),

  loyerActuel: z.number(),
  tauxApplicable: z.number(),
  loyerApresRevision: z.number(),

  dateDerniereRevision: z.string().nullable().optional(),
  dateProchaineRevision: z.string().nullable().optional(),
  eligibleRevision: z.boolean(),
  nombreRevisions: z.number().int(),
});

export type RevisionLoyerRequest = z.infer<typeof RevisionLoyerRequestSchema>;
export type RevisionLoyerResponse = z.infer<typeof RevisionLoyerResponseSchema>;
export type RevisionLoyerSummary = z.infer<typeof RevisionLoyerSummarySchema>;

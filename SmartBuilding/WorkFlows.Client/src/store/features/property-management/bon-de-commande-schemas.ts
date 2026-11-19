import { z } from 'zod';

export const BonDeCommandeRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  numeroBonCommande: z.string().min(1, 'Le numéro de bon de commande est requis.'),
  noPrestataire: z.number().int({ message: 'Le prestataire est requis.' }).min(1, 'Le prestataire est requis.'),

  dateCommande: z.string().min(1, 'La date de commande est requise.'),
  dateReception: z.string().nullable().optional(),
  compte: z.string().nullable().optional(),
  compteComptable: z.string().nullable().optional(),
  statutApprobation: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const BonDeCommandeResponseSchema = z.object({
  numero: z.number().int(),
  numeroBonCommande: z.string(),
  noPrestataire: z.number().int(),
  nomPrestataire: z.string().nullable().optional(),

  dateCommande: z.string(),
  dateReception: z.string().nullable().optional(),
  compte: z.string().nullable().optional(),
  compteComptable: z.string().nullable().optional(),
  statutApprobation: z.string(),
  notes: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type BonDeCommandeRequest = z.infer<typeof BonDeCommandeRequestSchema>;
export type BonDeCommandeResponse = z.infer<typeof BonDeCommandeResponseSchema>;

export const STATUTS_APPROBATION_BON_COMMANDE = ['En attente', 'Approuvé', 'Rejeté'] as const;

export const BonDeCommandeImportRowSchema = z.object({
  numeroBonCommande: z.string(),
  nomFournisseur: z.string(),
  dateCommande: z.string(),
  dateReception: z.string().nullable().optional(),
  compte: z.string().nullable().optional(),
  compteComptable: z.string().nullable().optional(),
  statutApprobation: z.string().nullable().optional(),
});

export const BonDeCommandeImportRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  rows: z.array(BonDeCommandeImportRowSchema),
});

export const BonDeCommandeImportResultSchema = z.object({
  importes: z.number().int(),
  erreurs: z.array(z.object({ ligne: z.number().int(), motif: z.string() })),
});

export type BonDeCommandeImportRow = z.infer<typeof BonDeCommandeImportRowSchema>;
export type BonDeCommandeImportRequest = z.infer<typeof BonDeCommandeImportRequestSchema>;
export type BonDeCommandeImportResult = z.infer<typeof BonDeCommandeImportResultSchema>;

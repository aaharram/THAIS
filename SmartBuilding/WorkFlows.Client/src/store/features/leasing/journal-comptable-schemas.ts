import { z } from 'zod';

export const JournalComptableLigneSchema = z.object({
  jrnlLineNbr: z.number().int(),
  effDate: z.string(),
  noBuilding: z.number().int(),
  immeuble: z.string().nullable().optional(),
  centre: z.string().nullable().optional(),
  catmin: z.string().nullable().optional(),
  compte: z.string().nullable().optional(),
  sousCompte: z.string().nullable().optional(),
  transAmt: z.number(),
  sensDrCr: z.string(),
  descp: z.string().nullable().optional(),
});

export const JournalComptableResponseSchema = z.object({
  typeJournal: z.string(),
  annee: z.number().int(),
  mois: z.number().int(),
  noProprietaire: z.number().int().nullable().optional(),
  lignes: z.array(JournalComptableLigneSchema),
  totalDebit: z.number(),
  totalCredit: z.number(),
  immeublesSansCompte: z.array(z.string()),
});

export const JournalComptableGenerationSchema = z.object({
  numero: z.number().int(),
  annee: z.number().int(),
  mois: z.number().int(),
  noProprietaire: z.number().int().nullable().optional(),
  proprietaire: z.string().nullable().optional(),
  typeJournal: z.string(),
  dateGeneration: z.string(),
  generePar: z.number().int(),
  nbLignes: z.number().int(),
  montantTotal: z.number(),
});

export type JournalComptableLigne = z.infer<typeof JournalComptableLigneSchema>;
export type JournalComptableResponse = z.infer<typeof JournalComptableResponseSchema>;
export type JournalComptableGeneration = z.infer<typeof JournalComptableGenerationSchema>;

export const TYPES_JOURNAL = [
  { value: 'EmissionLoyers', label: 'Émission Loyers' },
  { value: 'AnnulationEmissionLoyers', label: 'Annulation Émission Loyers' },
  { value: 'EmissionLoyersContentieux', label: 'Émission Loyers Contentieux' },
  { value: 'EncaissementLoyers', label: 'Encaissement Loyers' },
  { value: 'EncaissementLoyersContentieux', label: 'Encaissement Loyers Contentieux' },
] as const;

export const CompteComptableJournalRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),
  typeJournal: z.string().min(1, 'Le type de journal est requis'),
  typeSequenceComptable: z.string().min(1, 'La séquence comptable est requise'),
  compteDebit: z.string().min(1, 'Le compte débit est requis'),
  compteCredit: z.string().min(1, 'Le compte crédit est requis'),
  sousCompte: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const CompteComptableJournalResponseSchema = z.object({
  numero: z.number().int(),
  typeJournal: z.string(),
  typeSequenceComptable: z.string(),
  compteDebit: z.string(),
  compteCredit: z.string(),
  sousCompte: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type CompteComptableJournalRequest = z.infer<typeof CompteComptableJournalRequestSchema>;
export type CompteComptableJournalResponse = z.infer<typeof CompteComptableJournalResponseSchema>;

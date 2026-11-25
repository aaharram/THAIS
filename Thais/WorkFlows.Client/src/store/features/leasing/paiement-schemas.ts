import { z } from 'zod';

export const PaiementRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noLocation: z.number().int({ message: 'Le bail est requis.' }).min(1, 'Le bail est requis.'),
  noEncaisseur: z.number().int().nullable().optional(),

  montant: z.number({ message: 'Le montant est requis.' }).positive('Le montant doit être positif.'),
  modePaiement: z.string().min(1, 'Le mode de paiement est requis.'),
  datePaiement: z.string().nullable().optional(),
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const PaiementResponseSchema = z.object({
  numero: z.number().int(),
  noLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  nomEncaisseur: z.string().nullable().optional(),

  montant: z.number(),
  modePaiement: z.string(),
  datePaiement: z.string(),
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  demandeAnnulation: z.boolean().optional(),
  annule: z.boolean().optional(),
  rejete: z.boolean().optional(),
  dateAnnulation: z.string().nullable().optional(),
  periodeDebut: z.string().nullable().optional(),
  periodeFin: z.string().nullable().optional(),

  numRemiseBancaire: z.string().nullable().optional(),
  genere: z.boolean().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
});

export const RapportComptableLigneSchema = z.object({
  dateComptable: z.string(),
  type: z.string(),
  codeIntermediaire: z.string(),
  nomPayeur: z.string(),
  libelleOperation: z.string(),
  montant: z.string(),
  dateEncaissVirChequeEffet: z.string(),
  referencePaiement: z.string(),
  banqueVirementVersement: z.string(),
  villeCheque: z.string(),
  compteChequeEffetVirt: z.string(),
  nature: z.string(),
  direction: z.string(),
  codeService: z.string(),
  comptePieceComptable: z.string(),
  sousComptePieceComptable: z.string(),
  banqueVersementChequeEffetVirt: z.string(),
  agence: z.string(),
  comptevermtChqEffetVir: z.string(),
  lettrageCompensation: z.string(),
  refBx: z.string(),
  nomEncaisseur: z.string(),
  numRemiseBancaire: z.string(),
});

export const RapportComptableResponseSchema = z.object({
  lignes: z.array(RapportComptableLigneSchema),
});

export type RapportComptableLigne = z.infer<typeof RapportComptableLigneSchema>;
export type RapportComptableResponse = z.infer<typeof RapportComptableResponseSchema>;

export const PaiementSummarySchema = z.object({
  noLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomLocataire: z.string(),
  nomBuilding: z.string(),
  noProprietaire: z.number().int().nullable().optional(),
  noEncaisseur: z.number().int().nullable().optional(),
  nomEncaisseur: z.string().nullable().optional(),

  loyerMensuel: z.number(),
  nombreFacturesImpayees: z.number().int(),
  montantImpaye: z.number(),
});

export type PaiementRequest = z.infer<typeof PaiementRequestSchema>;
export type PaiementResponse = z.infer<typeof PaiementResponseSchema>;
export type PaiementSummary = z.infer<typeof PaiementSummarySchema>;

export const MODES_PAIEMENT = ['Espèce', 'Chèque', 'Effet', 'Virement bancaire'] as const;

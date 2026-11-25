import { z } from 'zod';

export const LocalRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }),
  noLocalType: z.number().int().nullable().optional(),
  designation: z.string().min(1, 'Le nom du local est requis.'),
  enExploitation: z.boolean().optional(),
  nondisponible: z.boolean().optional(),
  moyensGeneraux: z.boolean().optional(),
  mettreEnLocation: z.boolean().optional(),
  responsable: z.string().nullable().optional(),

  nbrePiece: z.number().int().nullable().optional(),
  surface: z.number().nullable().optional(),
  terrasse: z.number().nullable().optional(),
  address1: z.string().nullable().optional(),
  titreFoncier: z.string().nullable().optional(),
  aVendre: z.boolean().optional(),
  etage: z.string().nullable().optional(),
  dateModificationValeur: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  dernierLoyer: z.number().nullable().optional(),
  valeurEntree: z.number().nullable().optional(),
  valeurInventaire: z.number().nullable().optional(),
  valeurRealisation: z.number().nullable().optional(),
  observation: z.string().nullable().optional(),
  etat: z.string().nullable().optional(),
  demande: z.string().nullable().optional(),
  suggestion: z.string().nullable().optional(),
  montantAmenagement: z.number().nullable().optional(),

  offreLoyerHT: z.number().nullable().optional(),
  offreCharge: z.number().nullable().optional(),
  tva: z.number().nullable().optional(),
  offreTSC: z.number().nullable().optional(),

  inactif: z.boolean().optional(),

  prixCession: z.number().nullable().optional(),
  acquereur: z.string().nullable().optional(),
  promesseContratVente: z.string().nullable().optional(),
  dateSignaturePromesseVente: z.string().nullable().optional(),
  dateSignatureContratVente: z.string().nullable().optional(),
  dateEnregistrementContratVente: z.string().nullable().optional(),
  encaissementRecuCession: z.number().nullable().optional(),
  dateReglementCession: z.string().nullable().optional(),
  vendu: z.boolean().optional(),
});

export const LocalResponseSchema = z.object({
  numero: z.number().int(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noLocalType: z.number().int().nullable().optional(),
  nomLocalType: z.string().nullable().optional(),
  designation: z.string(),
  enExploitation: z.boolean(),
  nondisponible: z.boolean(),
  moyensGeneraux: z.boolean(),
  mettreEnLocation: z.boolean(),
  responsable: z.string().nullable().optional(),

  nbrePiece: z.number().int().nullable().optional(),
  surface: z.number().nullable().optional(),
  terrasse: z.number().nullable().optional(),
  address1: z.string().nullable().optional(),
  titreFoncier: z.string().nullable().optional(),
  aVendre: z.boolean(),
  etage: z.string().nullable().optional(),
  dateModificationValeur: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  dernierLoyer: z.number().nullable().optional(),
  valeurEntree: z.number().nullable().optional(),
  valeurInventaire: z.number().nullable().optional(),
  valeurRealisation: z.number().nullable().optional(),
  observation: z.string().nullable().optional(),
  etat: z.string().nullable().optional(),
  demande: z.string().nullable().optional(),
  suggestion: z.string().nullable().optional(),
  montantAmenagement: z.number().nullable().optional(),

  offreLoyerHT: z.number().nullable().optional(),
  offreCharge: z.number().nullable().optional(),
  tva: z.number().nullable().optional(),
  offreTSC: z.number().nullable().optional(),
  offreLoyerTTC: z.number().nullable().optional(),

  inactif: z.boolean(),

  prixCession: z.number().nullable().optional(),
  acquereur: z.string().nullable().optional(),
  promesseContratVente: z.string().nullable().optional(),
  dateSignaturePromesseVente: z.string().nullable().optional(),
  dateSignatureContratVente: z.string().nullable().optional(),
  dateEnregistrementContratVente: z.string().nullable().optional(),
  encaissementRecuCession: z.number().nullable().optional(),
  dateReglementCession: z.string().nullable().optional(),
  vendu: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type LocalRequest = z.infer<typeof LocalRequestSchema>;
export type LocalResponse = z.infer<typeof LocalResponseSchema>;

export const ETATS_LOCAL = ['Bon', 'Moyen', 'Mauvais', 'Trés Mauvais'] as const;
export const DEMANDES_LOCAL = ['Demandé', 'Moins Demandé', 'Trés Demandé'] as const;

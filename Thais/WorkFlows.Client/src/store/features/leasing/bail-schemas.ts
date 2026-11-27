import { z } from 'zod';

export const BailRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  numContratLocations: z.string().nullable().optional(),
  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noLocal: z.number().int({ message: 'Le local est requis.' }).min(1, 'Le local est requis.'),
  noLocataire: z.number().int({ message: 'Le locataire est requis.' }).min(1, 'Le locataire est requis.'),
  noEncaisseur: z.number().int().nullable().optional(),
  noPeriodicity: z.number().int().nullable().optional(),

  usage: z.string().nullable().optional(),
  dateDebut: z.string({ message: 'Le début de bail est requis.' }).min(1, 'Le début de bail est requis.'),
  dateGestion: z.string().nullable().optional(),
  dateFin: z.string().nullable().optional(),
  franchise: z.number().int().nullable().optional(),

  loyerNet: z.number().nullable().optional(),
  charges: z.number().nullable().optional(),
  tva: z.number().nullable().optional(),
  taxe: z.number().nullable().optional(),
  loyerGarage: z.number().nullable().optional(),
  autres: z.number().nullable().optional(),

  genererQuittance: z.boolean().optional(),
  garantie: z.number().nullable().optional(),
  caution: z.number().nullable().optional(),
  modeReglement: z.string().nullable().optional(),
  etat: z.string().min(1),

  notes: z.string().nullable().optional(),
  // RMANew (DataEntryLocation) : champs du formulaire de bail repris de RMA.
  typeSequenceComptable: z.string().nullable().optional(),
  tauxRevisionLoyer: z.number().nullable().optional(),
  duree: z.number().int().nullable().optional(),
  depotGarantie: z.boolean().optional(),
  cautionFichier: z.string().nullable().optional(),
  reference: z.string().nullable().optional(),
  dateReglement: z.string().nullable().optional(),
  resteCaution: z.number().nullable().optional(),
  utiliseeCaution: z.boolean().optional(),
  observation: z.string().nullable().optional(),
  loyersImpayes: z.number().nullable().optional(),
  debutImpayes: z.string().nullable().optional(),
  finImpayes: z.string().nullable().optional(),
  nbMoisImpayes: z.number().int().nullable().optional(),
  arrieresAugmentation: z.number().nullable().optional(),
  contentieux: z.boolean().optional(),
  debutArriere: z.string().nullable().optional(),
  finArriere: z.string().nullable().optional(),
  fraisJustice: z.number().nullable().optional(),
  contratFichier: z.string().nullable().optional(),
  inactif: z.boolean().optional(),
});

export const BailResponseSchema = z.object({
  numero: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noLocal: z.number().int(),
  nomLocal: z.string().nullable().optional(),
  etage: z.string().nullable().optional(),
  surface: z.number().nullable().optional(),
  noLocataire: z.number().int(),
  nomLocataire: z.string().nullable().optional(),
  // RMANew (ListLocation) : adresse du locataire et dates de révision du loyer.
  adresseLocataire: z.string().nullable().optional(),
  montantAvoirs: z.number().nullable().optional(),
  dateDerniereRevision: z.string().nullable().optional(),
  dateProchaineRevision: z.string().nullable().optional(),
  noEncaisseur: z.number().int().nullable().optional(),
  nomEncaisseur: z.string().nullable().optional(),
  noPeriodicity: z.number().int().nullable().optional(),
  nomPeriodicity: z.string().nullable().optional(),

  usage: z.string().nullable().optional(),
  dateDebut: z.string().nullable().optional(),
  dateGestion: z.string().nullable().optional(),
  dateFin: z.string().nullable().optional(),
  franchise: z.number().int().nullable().optional(),

  loyerNet: z.number().nullable().optional(),
  charges: z.number().nullable().optional(),
  tva: z.number().nullable().optional(),
  taxe: z.number().nullable().optional(),
  loyerGarage: z.number().nullable().optional(),
  autres: z.number().nullable().optional(),
  montant: z.number().nullable().optional(),

  genererQuittance: z.boolean(),
  garantie: z.number().nullable().optional(),
  caution: z.number().nullable().optional(),
  modeReglement: z.string().nullable().optional(),
  etat: z.string(),

  notes: z.string().nullable().optional(),
  // RMANew (DataEntryLocation) : champs du formulaire de bail repris de RMA.
  typeSequenceComptable: z.string().nullable().optional(),
  tauxRevisionLoyer: z.number().nullable().optional(),
  duree: z.number().int().nullable().optional(),
  depotGarantie: z.boolean().optional(),
  cautionFichier: z.string().nullable().optional(),
  reference: z.string().nullable().optional(),
  dateReglement: z.string().nullable().optional(),
  resteCaution: z.number().nullable().optional(),
  utiliseeCaution: z.boolean().optional(),
  observation: z.string().nullable().optional(),
  loyersImpayes: z.number().nullable().optional(),
  debutImpayes: z.string().nullable().optional(),
  finImpayes: z.string().nullable().optional(),
  nbMoisImpayes: z.number().int().nullable().optional(),
  arrieresAugmentation: z.number().nullable().optional(),
  contentieux: z.boolean().optional(),
  debutArriere: z.string().nullable().optional(),
  finArriere: z.string().nullable().optional(),
  fraisJustice: z.number().nullable().optional(),
  contratFichier: z.string().nullable().optional(),
  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type BailRequest = z.infer<typeof BailRequestSchema>;
export type BailResponse = z.infer<typeof BailResponseSchema>;

// Documents libres d'un bail (bloc « Pièces jointes » de la fiche RMANew).
export const BailPieceJointeSchema = z.object({
  numero: z.number().int(),
  noLocation: z.number().int(),
  fileName: z.string(),
  pieceJointe: z.string(),
  taille: z.number(),
  addDate: z.string(),
});
export type BailPieceJointe = z.infer<typeof BailPieceJointeSchema>;

export const ETATS_BAIL = ['En cours de location', 'Location Terminée', 'Suspendu'] as const;
export const MODES_REGLEMENT = ['Chèque', 'Effet', 'Virement', 'Compensation', 'Carte monétique', 'Prélèvement', 'Transfert', 'Versement'] as const;
// RMANew (DataEntryLocation, LXTypeSéquencecomptable)
export const TYPES_SEQUENCE_COMPTABLE = ['ADMIS', 'ADMIS TVA', 'LIBRE', 'LIBRE TVA'] as const;

import { z } from 'zod';

export const LocataireRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  typeLocataire: z.number().int().min(0).max(1),
  codeLocataire: z.string().nullable().optional(),
  designationEntreprise: z.string().nullable().optional(),
  idF: z.string().nullable().optional(),
  ice: z.string().min(1, 'ICE est obligatoire'),
  nom: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),

  rc: z.string().nullable().optional(),
  noCIN: z.string().min(1, 'CIN est obligatoire'),
  prenom: z.string().nullable().optional(),
  telephone: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  noCity: z.number().int().nullable().optional(),
  noCountry: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),

  noBuilding: z.number().int().nullable().optional(),
  noLocal: z.number().int().nullable().optional(),

  statutsDispo: z.boolean().optional(),
  rcDispo: z.boolean().optional(),
  pieceIdentiteDispo: z.boolean().optional(),
  autresDispo: z.boolean().optional(),

  autreContactNom: z.string().nullable().optional(),
  autreContactPrenom: z.string().nullable().optional(),
  autreContactTelephone: z.string().nullable().optional(),
  autreContactPoste: z.string().nullable().optional(),
  autreContactEmail: z.string().nullable().optional(),

  inactif: z.boolean().optional(),
});

export const LocataireResponseSchema = z.object({
  numero: z.number().int(),
  typeLocataire: z.number().int(),
  nom: z.string().nullable().optional(),
  prenom: z.string().nullable().optional(),
  designationEntreprise: z.string().nullable().optional(),
  nomAffiche: z.string(),
  rc: z.string().nullable().optional(),
  idF: z.string().nullable().optional(),
  noCIN: z.string().nullable().optional(),
  ice: z.string().nullable().optional(),
  codeLocataire: z.string().nullable().optional(),

  telephone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  adresse: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  noCity: z.number().int().nullable().optional(),
  nomCity: z.string().nullable().optional(),
  noCountry: z.number().int().nullable().optional(),
  nomCountry: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  noBuilding: z.number().int().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  noLocal: z.number().int().nullable().optional(),
  nomLocal: z.string().nullable().optional(),

  statutsDispo: z.boolean(),
  rcDispo: z.boolean(),
  pieceIdentiteDispo: z.boolean(),
  autresDispo: z.boolean(),
  tauxAvancement: z.number().int(),

  autreContactNom: z.string().nullable().optional(),
  autreContactPrenom: z.string().nullable().optional(),
  autreContactTelephone: z.string().nullable().optional(),
  autreContactPoste: z.string().nullable().optional(),
  autreContactEmail: z.string().nullable().optional(),

  inactif: z.boolean(),

  // RMANew (ListArchivesLocataires.vb) : snapshot du dernier bail connu - peuplé
  // uniquement sur la liste Archives, absent partout ailleurs.
  loyerMensuel: z.number().nullable().optional(),
  periodeImpayesDebut: z.string().nullable().optional(),
  periodeImpayesFin: z.string().nullable().optional(),
  nbMoisImpaye: z.number().int().nullable().optional(),
  montantImpaye: z.number().nullable().optional(),
  etat: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type LocataireRequest = z.infer<typeof LocataireRequestSchema>;
export type LocataireResponse = z.infer<typeof LocataireResponseSchema>;

export const TYPES_LOCATAIRE = [
  { value: 0, label: 'Personne physique' },
  { value: 1, label: 'Personne morale' },
] as const;

export const ETATS_DOCUMENT = [
  { value: false, label: 'Incomplet' },
  { value: true, label: 'Complet' },
] as const;

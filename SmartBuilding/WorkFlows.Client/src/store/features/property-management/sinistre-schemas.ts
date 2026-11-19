import { z } from 'zod';

export const SinistreRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  noLocal: z.number().int().nullable().optional(),
  noAssurance: z.number().int().nullable().optional(),
  noTypeSinistre: z.number().int({ message: 'Le type de sinistre est requis.' }).min(1, 'Le type de sinistre est requis.'),

  etapeSuivi: z.string().nullable().optional(),
  dateDeclaration: z.string().nullable().optional(),
  dateExpertise: z.string().nullable().optional(),
  dateReclamation: z.string().nullable().optional(),
  dateRemboursement: z.string().nullable().optional(),

  estimationDegatBailleur: z.number().nullable().optional(),
  estimationDegatLocataire: z.number().nullable().optional(),
  montantFacture: z.number().nullable().optional(),
  montantRemuneration: z.number().nullable().optional(),

  cumul: z.number().int().nullable().optional(),
  nomExpert: z.string().nullable().optional(),
  refDossierAssurance: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  noSinistre: z.string().nullable().optional(),
  agentAyantReclame: z.string().nullable().optional(),
  compteurFicheIntervention: z.string().nullable().optional(),
  referenceDossierDAG: z.string().nullable().optional(),
  montantExpert: z.number().nullable().optional(),
  referenceFacture: z.string().nullable().optional(),
  objetReclamation: z.string().nullable().optional(),
  site: z.string().nullable().optional(),
  // cheminExpertiseLocataire/Bailleur/PVExpertise ne sont pas dans la requête : ce sont
  // des pièces jointes gérées par uploadSinistreAttachment (endpoints dédiés).
});

export const SinistreResponseSchema = z.object({
  numero: z.number().int(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  noLocal: z.number().int().nullable().optional(),
  nomLocal: z.string().nullable().optional(),
  noAssurance: z.number().int().nullable().optional(),
  numPoliceAssurance: z.string().nullable().optional(),
  noTypeSinistre: z.number().int(),
  nomTypeSinistre: z.string().nullable().optional(),

  etapeSuivi: z.string(),
  dateDeclaration: z.string().nullable().optional(),
  dateExpertise: z.string().nullable().optional(),
  dateReclamation: z.string().nullable().optional(),
  dateRemboursement: z.string().nullable().optional(),

  estimationDegatBailleur: z.number().nullable().optional(),
  estimationDegatLocataire: z.number().nullable().optional(),
  montantFacture: z.number().nullable().optional(),
  montantRemuneration: z.number().nullable().optional(),

  cumul: z.number().int().nullable().optional(),
  nomExpert: z.string().nullable().optional(),
  refDossierAssurance: z.string().nullable().optional(),
  idSinistre: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),

  noSinistre: z.string().nullable().optional(),
  agentAyantReclame: z.string().nullable().optional(),
  compteurFicheIntervention: z.string().nullable().optional(),
  referenceDossierDAG: z.string().nullable().optional(),
  montantExpert: z.number().nullable().optional(),
  referenceFacture: z.string().nullable().optional(),
  objetReclamation: z.string().nullable().optional(),
  site: z.string().nullable().optional(),

  cheminExpertiseLocataire: z.string().nullable().optional(),
  cheminExpertiseBailleur: z.string().nullable().optional(),
  cheminPVExpertise: z.string().nullable().optional(),

  nomLocataire: z.string().nullable().optional(),
  nomAssureur: z.string().nullable().optional(),
  nomCourtier: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type SinistreRequest = z.infer<typeof SinistreRequestSchema>;
export type SinistreResponse = z.infer<typeof SinistreResponseSchema>;

export const ETAPES_SUIVI_SINISTRE = ['Déclaré', 'Expertise', 'Réclamation', 'Remboursement', 'Clôturé'] as const;

import { z } from 'zod';

export const AttestationRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noLocation: z.number().int({ message: 'Le contrat est requis.' }).min(1, 'Le contrat est requis.'),
  noLocataire: z.number().int({ message: 'Le client est requis.' }).min(1, 'Le client est requis.'),

  typeAttestation: z.string().min(1),
  dateAttestation: z.string().nullable().optional(),
  dateDebut: z.string().nullable().optional(),
  dateFin: z.string().nullable().optional(),

  inactif: z.boolean().optional(),
});

export const AttestationResponseSchema = z.object({
  numero: z.number().int(),

  noLocation: z.number().int(),
  numContratLocations: z.string().nullable().optional(),
  nomBuilding: z.string().nullable().optional(),
  noLocataire: z.number().int(),
  nomLocataire: z.string().nullable().optional(),

  typeAttestation: z.string(),
  dateAttestation: z.string().nullable().optional(),
  dateDebut: z.string().nullable().optional(),
  dateFin: z.string().nullable().optional(),

  inactif: z.boolean(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type AttestationRequest = z.infer<typeof AttestationRequestSchema>;
export type AttestationResponse = z.infer<typeof AttestationResponseSchema>;

export const TYPES_ATTESTATION = ['Attestation regularité fiscal', 'Attestation retenue a la source'] as const;

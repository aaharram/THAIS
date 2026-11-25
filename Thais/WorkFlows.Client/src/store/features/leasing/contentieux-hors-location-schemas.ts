import { z } from 'zod';

export const ContentieuxHorsLocationRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  locataire: z.string().nullable().optional(),
  codeLocataire: z.string().nullable().optional(),
  immeuble: z.string().nullable().optional(),
  loyerMensuelTTC: z.number().nullable().optional(),
  dateDebutImpaye: z.string().min(1, 'Le champ date début ne peut pas être vide'),
  dateFinImpaye: z.string().min(1, 'Le champ date fin ne peut pas être vide'),
  montantLoyerImpaye: z.number().nullable().optional(),
  type: z.number().int(),
});

export const ContentieuxHorsLocationResponseSchema = z.object({
  numero: z.number().int(),

  locataire: z.string().nullable().optional(),
  codeLocataire: z.string().nullable().optional(),
  immeuble: z.string().nullable().optional(),
  loyerMensuelTTC: z.number().nullable().optional(),
  dateDebutImpaye: z.string(),
  dateFinImpaye: z.string(),
  montantLoyerImpaye: z.number().nullable().optional(),
  type: z.number().int(),
  nbMoisImpaye: z.number().int(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type ContentieuxHorsLocationRequest = z.infer<typeof ContentieuxHorsLocationRequestSchema>;
export type ContentieuxHorsLocationResponse = z.infer<typeof ContentieuxHorsLocationResponseSchema>;

// DataEntryContentieuxHorsLocation.aspx (LXType) : 0 = Amiable, 1 = Confié / Avocat
export const TYPES_CONTENTIEUX_HORS_LOCATION = [
  { value: 0, label: 'Amiable' },
  { value: 1, label: 'Confié / Avocat' },
] as const;

import { z } from 'zod';

export const VncRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int({ message: "L'actif est requis." }).min(1, "L'actif est requis."),
  montantVNC: z.number().nullable().optional(),
  dateVNC: z.string().nullable().optional(),
});

export const VncResponseSchema = z.object({
  numero: z.number().int(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  montantVNC: z.number().nullable().optional(),
  dateVNC: z.string().nullable().optional(),

  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export const VncSummarySchema = z.object({
  noBuilding: z.number().int(),
  codeImmeuble: z.string(),
  nomBuilding: z.string(),
  adresse: z.string().nullable().optional(),
  affectation: z.string().nullable().optional(),
  usage: z.string().nullable().optional(),
  valeurBrut: z.number().nullable().optional(),
  derniereVnc: z.number().nullable().optional(),
  dateDerniereVnc: z.string().nullable().optional(),
  nombreVersions: z.number().int(),
  nombreProvisions: z.number().int(),
});

export type VncRequest = z.infer<typeof VncRequestSchema>;
export type VncResponse = z.infer<typeof VncResponseSchema>;
export type VncSummary = z.infer<typeof VncSummarySchema>;

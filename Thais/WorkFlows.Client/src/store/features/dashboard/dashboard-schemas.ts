import { z } from 'zod';

export const DashboardMoisResponseSchema = z.object({
  annee: z.number().int(),
  mois: z.number().int(),
  libelle: z.string(),
  quittance: z.number(),
  encaisse: z.number(),
});

export const DashboardLocalResponseSchema = z.object({
  numero: z.number().int(),
  designation: z.string(),
  actif: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  etage: z.string().nullable().optional(),
  surface: z.number().nullable().optional(),
  occupe: z.boolean(),
  locataire: z.string().nullable().optional(),
  loyer: z.number().nullable().optional(),
});

export const DashboardResponseSchema = z.object({
  nbActifs: z.number().int(),
  nbLocaux: z.number().int(),
  loyerPrevisionnelAnnuel: z.number(),
  budgetCharge: z.number(),
  tauxOccupation: z.number(),
  montantRealisation: z.number(),
  tauxRealisation: z.number(),
  rendement: z.number(),
  montantEncaissements: z.number(),
  tauxEncaissement: z.number(),
  montantDecaissement: z.number(),
  tauxDecaissement: z.number(),
  quittancesVsEncaisses: z.array(DashboardMoisResponseSchema),
  locaux: z.array(DashboardLocalResponseSchema).optional(),
});

export type DashboardLocalResponse = z.infer<typeof DashboardLocalResponseSchema>;

export type DashboardMoisResponse = z.infer<typeof DashboardMoisResponseSchema>;
export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;

export const DashboardActifResponseSchema = z.object({
  numero: z.number().int(),
  designation: z.string(),
});

export type DashboardActifResponse = z.infer<typeof DashboardActifResponseSchema>;

export interface DashboardFilters {
  noProprietaire?: number;
  noCity?: number;
  noLocalType?: number;
  noBuilding?: number;
}

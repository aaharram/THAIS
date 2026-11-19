import { z } from 'zod';

export const RemiseResponseSchema = z.object({
  numero: z.number().int(),
  numRemise: z.string().nullable().optional(),
  montant: z.number(),
  montantRestant: z.number().nullable().optional(),
  statut: z.number().int(),
  reference: z.string().nullable().optional(),
  isAnnuler: z.boolean(),
  dateAnnulation: z.string().nullable().optional(),
  addDate: z.string(),
});

export type RemiseResponse = z.infer<typeof RemiseResponseSchema>;

// RMANew (ListRemise.vb, PostProcess "Statuts") : Statut brut 0/1, "Annulé" prend le
// dessus quand isAnnuler=true, indépendamment de la valeur de Statut.
export const STATUTS_REMISE = [
  { value: 0, label: 'Non consommé' },
  { value: 1, label: 'Consommé' },
] as const;

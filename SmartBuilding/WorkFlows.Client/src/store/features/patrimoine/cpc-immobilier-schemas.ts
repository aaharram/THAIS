import { z } from 'zod';

export const CpcImmobilierRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),

  noBuilding: z.number().int().min(1, "L'actif est requis"),
  annee: z.number().int().min(2000, "L'année est requise"),

  revenusImmobilierVie: z.number().default(0),
  revenusImmobilierNonVie: z.number().default(0),
  plusValuesImmobilieresVie: z.number().default(0),
  plusValuesImmobilieresNonVie: z.number().default(0),
  reprisesImmobilieresLoyersVie: z.number().default(0),
  reprisesImmobilieresLoyersNonVie: z.number().default(0),
  chargesImmobilieresVie: z.number().default(0),
  chargesImmobilieresNonVie: z.number().default(0),
  moinsValuesImmobilieresVie: z.number().default(0),
  moinsValuesImmobilieresNonVie: z.number().default(0),
  dotationsImmobilieresVie: z.number().default(0),
  dotationsImmobilieresNonVie: z.number().default(0),
  provisionsImmobilieresVie: z.number().default(0),
  provisionsImmobilieresNonVie: z.number().default(0),

  notes: z.string().nullable().optional(),
});

export const CpcImmobilierResponseSchema = z.object({
  numero: z.number().int(),
  noBuilding: z.number().int(),
  nomBuilding: z.string().nullable().optional(),
  annee: z.number().int(),

  revenusImmobilierVie: z.number(),
  revenusImmobilierNonVie: z.number(),
  plusValuesImmobilieresVie: z.number(),
  plusValuesImmobilieresNonVie: z.number(),
  reprisesImmobilieresLoyersVie: z.number(),
  reprisesImmobilieresLoyersNonVie: z.number(),
  chargesImmobilieresVie: z.number(),
  chargesImmobilieresNonVie: z.number(),
  moinsValuesImmobilieresVie: z.number(),
  moinsValuesImmobilieresNonVie: z.number(),
  dotationsImmobilieresVie: z.number(),
  dotationsImmobilieresNonVie: z.number(),
  provisionsImmobilieresVie: z.number(),
  provisionsImmobilieresNonVie: z.number(),

  resultatVie: z.number(),
  resultatNonVie: z.number(),

  notes: z.string().nullable().optional(),
  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type CpcImmobilierRequest = z.infer<typeof CpcImmobilierRequestSchema>;
export type CpcImmobilierResponse = z.infer<typeof CpcImmobilierResponseSchema>;

export const CPC_CHAMPS: { key: keyof CpcImmobilierRequest; label: string }[] = [
  { key: 'revenusImmobilierVie', label: 'Revenus immobilier' },
  { key: 'plusValuesImmobilieresVie', label: 'Plus values immobilières' },
  { key: 'reprisesImmobilieresLoyersVie', label: 'Reprises immobilières Loyers' },
  { key: 'chargesImmobilieresVie', label: 'Charges immobilières' },
  { key: 'moinsValuesImmobilieresVie', label: 'Moins values immobilières' },
  { key: 'dotationsImmobilieresVie', label: 'Dotations immobilières' },
  { key: 'provisionsImmobilieresVie', label: 'Provisions immobilières' },
];

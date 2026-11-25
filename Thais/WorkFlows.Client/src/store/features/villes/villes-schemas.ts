import { z } from 'zod';

export const VilleRequestSchema = z.object({
  addUser: z.number().int().nullable(),
  modUser: z.number().int().nullable(),
  titleF: z.string().optional(),
  noCountry: z.number().int(),
});

export const villeResponseSchema = z.object({
  numero: z.number().int(),
  addUser: z.number().int().nullable(),
  nameAddUser: z.string().nullable(),
  roleAddUser: z.string().nullable(),
  addDate: z.date(),
  modUser: z.number().int().nullable(),
  nameModUser: z.string().nullable(),
  roleModUser: z.string().nullable(),
  modDate: z.date(),
  titleF: z.string().optional(),
  noCountry: z.number().int(),
  nameCountry: z.string().nullable(),
  noProvince: z.number().int().nullable(),
  nameProvince: z.string().nullable(),
});

export type VilleResponse = z.infer<typeof villeResponseSchema>;
export type VilleRequest = z.infer<typeof VilleRequestSchema>;

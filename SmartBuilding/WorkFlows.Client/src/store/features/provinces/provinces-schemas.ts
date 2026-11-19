import { z } from 'zod';

export const ProvinceResponseSchema = z.object({
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
});

export type ProvinceResponse = z.infer<typeof ProvinceResponseSchema>;

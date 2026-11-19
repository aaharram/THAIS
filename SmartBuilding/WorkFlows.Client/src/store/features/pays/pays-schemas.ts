import { z } from 'zod';

export const paysResponseSchema = z.object({
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
});

export type PaysResponse = z.infer<typeof paysResponseSchema>;

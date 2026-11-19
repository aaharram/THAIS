import { z } from 'zod';

export const TypologieChargeRequestSchema = z.object({
  addUser: z.number().int().nullable().optional(),
  modUser: z.number().int().nullable().optional(),
  typologie: z.string().min(1, 'La typologie est requise.'),
  compte: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const TypologieChargeResponseSchema = z.object({
  numero: z.number().int(),
  typologie: z.string(),
  compte: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  addUser: z.number().int().nullable().optional(),
  addDate: z.string(),
  modUser: z.number().int().nullable().optional(),
  modDate: z.string(),
});

export type TypologieChargeRequest = z.infer<typeof TypologieChargeRequestSchema>;
export type TypologieChargeResponse = z.infer<typeof TypologieChargeResponseSchema>;

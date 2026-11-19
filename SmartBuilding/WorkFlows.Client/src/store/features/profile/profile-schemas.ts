import { z } from 'zod';

export const ProfileRequestSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  tel: z.string().optional(),
  address: z.string().optional(),
});

export type ProfileRequest = z.infer<typeof ProfileRequestSchema>;

export const profileResponseSchema = z.object({
  numero: z.number(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  name: z.string(),
  email: z.string(),
  address: z.string(),
  tel: z.string(),
  role: z.string().nullable().optional(),
  urlPicture: z.string().nullable().optional(),
  nomGestionnaire: z.string().nullable().optional(),
  nomPatrimoineType: z.string().nullable().optional(),
});

export type ProfileResponse = z.infer<typeof profileResponseSchema>;

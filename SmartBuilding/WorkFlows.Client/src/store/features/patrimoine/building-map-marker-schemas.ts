import { z } from 'zod';

export const BuildingMapMarkerResponseSchema = z.object({
  numero: z.number().int(),
  designation: z.string(),
  address1: z.string().nullable().optional(),
  nomBuildingType: z.string().nullable().optional(),
  nomCity: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

export type BuildingMapMarkerResponse = z.infer<typeof BuildingMapMarkerResponseSchema>;

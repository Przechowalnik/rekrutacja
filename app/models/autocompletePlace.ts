import { z } from "zod";

import { Z_City } from "./city";

export const Z_AutocompletePlace = z.object({
  city: z.string(),
  cityWithDistricts: Z_City.nullable().optional(),
  country: z.string(),
  district: z.string().nullable().optional(),
  flatNumber: z.string().nullable().optional(),
  full: z.string(),
  postalCode: z.string(),
  street: z.string(),
  streetNumber: z.string().nullable().optional(),
});

export type T_AutocompletePlace = z.infer<typeof Z_AutocompletePlace>;

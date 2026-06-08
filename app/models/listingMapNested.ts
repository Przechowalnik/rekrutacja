import { z } from "zod";

import { Z_Country, Z_ListingCategory, Z_WorkMode } from "./enums";

const Z_ListingMapLocationCity = z.object({
  id: z.string(),
  name: z.string(),
  nameSearch: z.string(),
});

const Z_ListingMapLocationDistrict = z.object({
  id: z.string(),
  name: z.string(),
  nameSearch: z.string(),
});

const Z_ListingMapNestedLocation = z.object({
  city: Z_ListingMapLocationCity.nullable().optional(),
  cityCustom: z.string().nullable().optional(),
  country: Z_Country,
  district: Z_ListingMapLocationDistrict.nullable().optional(),
  flatNumber: z.string().nullable().optional(),
  lat: z.number(),
  lng: z.number(),
  postalCode: z.string(),
  streetName: z.string(),
  streetNumber: z.string(),
});

const Z_ListingMapImage = z.object({
  id: z.string(),
  isDefault: z.boolean(),
  url: z.string(),
});

export const Z_ListingMapNested = z.object({
  category: Z_ListingCategory,
  id: z.string().uuid(),
  images: Z_ListingMapImage.array(),
  location: Z_ListingMapNestedLocation.nullable().optional(),
  salaryFrom: z.number().nullable().optional(),
  salaryTo: z.number().nullable().optional(),
  slug: z.string().nullable().optional(),
  title: z.string(),
  workMode: Z_WorkMode,
});

export type T_ListingMapNested = z.infer<typeof Z_ListingMapNested>;
export type T_ListingMapImage = z.infer<typeof Z_ListingMapImage>;

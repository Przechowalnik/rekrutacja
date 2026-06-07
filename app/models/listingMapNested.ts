import { z } from "zod";

import { Z_Country, Z_ListingContractType, Z_ListingType } from "./enums";

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
  area: z.bigint().or(z.number()).nullable().optional(),
  contractType: Z_ListingContractType.nullable().optional(),
  id: z.string().uuid(),
  images: Z_ListingMapImage.array(),
  location: Z_ListingMapNestedLocation.nullable().optional(),
  negotiable: z.boolean(),
  price: z.bigint().or(z.number()),
  slug: z.string().nullable().optional(),
  title: z.string(),
  type: Z_ListingType,
});

export type T_ListingMapNested = z.infer<typeof Z_ListingMapNested>;
export type T_ListingMapImage = z.infer<typeof Z_ListingMapImage>;

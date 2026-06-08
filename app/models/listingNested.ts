import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import {
  Z_Country,
  Z_ListingCategory,
  Z_ListingStatus,
  Z_WorkMode,
} from "./enums";

const Z_ListingLocationCity = z.object({
  id: z.string(),
  name: z.string(),
  nameSearch: z.string(),
});

const Z_ListingLocationDistrict = z.object({
  id: z.string(),
  name: z.string(),
  nameSearch: z.string(),
});

export const Z_ListingNearestCity = z.object({
  id: z.string(),
  name: z.string(),
  nameSearch: z.string(),
});

const Z_ListingNestedLocation = z.object({
  city: Z_ListingLocationCity.nullable().optional(),
  cityCustom: z.string().nullable().optional(),
  country: Z_Country,
  district: Z_ListingLocationDistrict.nullable().optional(),
  flatNumber: z.string().nullable().optional(),
  lat: z.number(),
  lng: z.number(),
  nearestCity: Z_ListingNearestCity.nullable().optional(),
  postalCode: z.string(),
  streetName: z.string(),
  streetNumber: z.string(),
});

const Z_ListingUserOrCompanyPhone = z.object({
  countryCode: z.number().nullable(),
  number: z.bigint().or(z.number()).nullable(),
  verifiedAt: zodDateValidator().nullable(),
});

const Z_ListingNestedUser = z.object({
  avatar: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  firstName: z.string(),
  id: z.string().uuid(),
  lastName: z.string().nullable().optional(),
  phone: Z_ListingUserOrCompanyPhone.nullable().optional(),
});

const Z_ListingNestedCompany = z.object({
  avatar: z.string().nullable().optional(),
  id: z.string().uuid(),
  name: z.string(),
  phone: Z_ListingUserOrCompanyPhone.nullable().optional(),
  slug: z.string().nullable().optional(),
  workers: z
    .array(z.object({ email: z.string() }))
    .nullable()
    .optional(),
});

const Z_ListingImage = z.object({
  id: z.string(),
  isDefault: z.boolean(),
  url: z.string(),
});

export const Z_ListingNested = z.object({
  availableFrom: zodDateValidator().nullable().optional(),
  category: Z_ListingCategory,
  company: Z_ListingNestedCompany.nullable().optional(),
  createdAt: zodDateValidator(),
  description: z.string().nullable().optional(),
  expiresAt: zodDateValidator().nullable().optional(),
  id: z.string().uuid(),
  images: Z_ListingImage.array(),
  location: Z_ListingNestedLocation.nullable().optional(),
  salaryFrom: z.number().nullable().optional(),
  salaryTo: z.number().nullable().optional(),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  slug: z.string().nullable().optional(),
  status: Z_ListingStatus,
  title: z.string(),
  updatedAt: zodDateValidator(),
  user: Z_ListingNestedUser.nullable().optional(),
  workMode: Z_WorkMode,
});

export type T_ListingImage = z.infer<typeof Z_ListingImage>;
export type T_ListingNearestCity = z.infer<typeof Z_ListingNearestCity>;
export type T_ListingNested = z.infer<typeof Z_ListingNested>;

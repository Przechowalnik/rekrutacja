import { z } from "zod";

import { zodDateValidator } from "~/utilities/date";

import {
  Z_Country,
  Z_ListingAccess,
  Z_ListingCategory,
  Z_ListingComfortOption,
  Z_ListingCondition,
  Z_ListingContainerType,
  Z_ListingContractType,
  Z_ListingEntryOption,
  Z_ListingParkingType,
  Z_ListingPlotType,
  Z_ListingSecurityOption,
  Z_ListingStatus,
  Z_ListingType,
  Z_ListingUnitType,
  Z_ListingUsageOptions,
  Z_ListingUtilityOption,
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
});

const Z_ListingImage = z.object({
  id: z.string(),
  isDefault: z.boolean(),
  url: z.string(),
});

export const Z_ListingNested = z.object({
  access: Z_ListingAccess.nullable().optional(),
  area: z.bigint().or(z.number()).nullable().optional(),
  availableFrom: zodDateValidator(),
  availableTo: zodDateValidator().nullable().optional(),
  category: Z_ListingCategory,
  comfortOptions: Z_ListingComfortOption.array(),
  company: Z_ListingNestedCompany.nullable().optional(),
  condition: Z_ListingCondition.nullable().optional(),
  containerType: Z_ListingContainerType.nullable().optional(),
  contractType: Z_ListingContractType.nullable().optional(),
  createdAt: zodDateValidator(),
  description: z.string().nullable().optional(),
  entryOptions: Z_ListingEntryOption.array(),
  expiresAt: zodDateValidator().nullable().optional(),
  floorLevel: z.number().nullable().optional(),
  id: z.string().uuid(),
  images: Z_ListingImage.array(),
  location: Z_ListingNestedLocation.nullable().optional(),
  minimumRentalDays: z.number().nullable().optional(),
  negotiable: z.boolean(),
  parkingType: Z_ListingParkingType.nullable().optional(),
  plotType: Z_ListingPlotType.nullable().optional(),
  price: z.bigint().or(z.number()),
  securityOptions: Z_ListingSecurityOption.array(),
  slug: z.string().nullable().optional(),
  status: Z_ListingStatus,
  title: z.string(),
  type: Z_ListingType,
  unitType: Z_ListingUnitType.nullable().optional(),
  updatedAt: zodDateValidator(),
  usageOptions: Z_ListingUsageOptions.array(),
  user: Z_ListingNestedUser.nullable().optional(),
  utilityOptions: Z_ListingUtilityOption.array(),
});

export type T_ListingImage = z.infer<typeof Z_ListingImage>;
export type T_ListingNearestCity = z.infer<typeof Z_ListingNearestCity>;
export type T_ListingNested = z.infer<typeof Z_ListingNested>;

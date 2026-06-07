import { z } from "zod";

const Z_CityName = z.string();
const Z_CityDistrictName = z.string();

export const Z_CityDistrictNested = z.object({
  id: z.string(),
  lat: z.number(),
  lng: z.number(),
  name: Z_CityDistrictName,
  nameSearch: z.string(),
});

export const Z_CityDistrictsNested = Z_CityDistrictNested.array();

export const Z_CityNested = z.object({
  districts: Z_CityDistrictsNested,
  id: z.string(),
  lat: z.number(),
  lng: z.number(),
  name: Z_CityName,
  nameSearch: z.string(),
  radiusKm: z.number(),
  voivodeship: z.string(),
});

export type T_CityNested = z.infer<typeof Z_CityNested>;
export type T_CityDistrict = z.infer<typeof Z_CityDistrictNested>;
export type T_CityDistricts = z.infer<typeof Z_CityDistrictsNested>;
export type T_CityName = z.infer<typeof Z_CityName>;
export type T_CityDistrictName = z.infer<typeof Z_CityDistrictName>;
